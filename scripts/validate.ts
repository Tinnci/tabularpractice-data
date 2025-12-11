import { join } from 'path';
import { readdir, readFile, stat } from 'fs/promises';

const ROOT_DIR = process.cwd();

// --- Types (Based on DATA_REPO_STRUCTURE.md) ---
interface PaperGroup {
    id: string;
    name: string;
    type: 'unified' | 'self_proposed';
    subjectKey?: string;
}

// Root index.json contains Question summaries (for fast initial load)
interface QuestionSummary {
    id: string;
    paperId: string;
    number: number;
    year?: number;
    type: 'choice' | 'fill' | 'answer';
    tags: string[];
    subject?: string;
    category?: string;
    contentImgThumb?: string;
}

// papers/*/index.json
interface PaperDetail {
    paperId: string;
    year?: string | number;
    subjectKey?: string;
    tags?: string[];
    questions: Record<string, Question>;
}


type BlockerType = 'representation' | 'function' | 'constraint' | 'analogy';

interface EurekaData {
    diagnostic?: {
        question: string;
        options: Array<{
            type: BlockerType;
            label: string;
            hint: string;
        }>;
    };
    modelLineup?: {
        question: string;
        options: Array<{
            id: string;
            label: string;
            formula?: string;
            isCorrect: boolean;
            feedback: string;
        }>;
    };
    variableRoles?: Array<{
        target: string;
        currentRole: string;
        suggestedRole: string;
        transformation: string;
    }>;
    strategies?: Array<{
        title: string;
        trigger: string;
        action: string;
    }>;
    insight?: string;
}

interface Question {
    id: string;
    paperId: string;
    number: number;
    type: string;
    tags?: string[];
    eureka?: EurekaData;
}

interface Tag {
    id: string;
    label?: string;
    name?: string;
    children?: Tag[];
    parentId?: string | null;
}

// --- Helpers ---
let errorCount = 0;
let warnCount = 0;

function error(msg: string) {
    console.error(`\x1b[31m✖ ${msg}\x1b[0m`);
    errorCount++;
}

function warn(msg: string) {
    console.warn(`\x1b[33m⚠ ${msg}\x1b[0m`);
    warnCount++;
}

function success(msg: string) {
    console.log(`\x1b[32m✔ ${msg}\x1b[0m`);
}

async function readJson<T>(path: string): Promise<T | null> {
    try {
        const content = await readFile(path, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        error(`Failed to parse JSON at ${path}: ${e}`);
        return null;
    }
}

async function exists(path: string): Promise<boolean> {
    try {
        await stat(path);
        return true;
    } catch {
        return false;
    }
}

// --- Validators ---

async function validatePaperGroups(): Promise<Set<string>> {
    console.log('\n📁 Checking paperGroups.json...');
    const groups = await readJson<PaperGroup[]>(join(ROOT_DIR, 'paperGroups.json'));
    if (!groups) return new Set();

    if (!Array.isArray(groups)) {
        error('paperGroups.json must be an array');
        return new Set();
    }

    const groupIds = new Set<string>();
    groups.forEach((g, i) => {
        if (!g.id) error(`Group at index ${i} missing 'id'`);
        if (!g.name) error(`Group ${g.id || i} missing 'name'`);
        if (!g.type) warn(`Group ${g.id} missing 'type'`);
        groupIds.add(g.id);
    });

    success(`Validated ${groups.length} paper groups: [${Array.from(groupIds).join(', ')}]`);
    return groupIds;
}

async function validateTags(): Promise<Set<string>> {
    console.log('\n📁 Checking tags.json...');
    const tags = await readJson<Tag[]>(join(ROOT_DIR, 'tags.json'));
    if (!tags) return new Set();

    const tagIds = new Set<string>();

    function traverse(nodes: Tag[]) {
        nodes.forEach(node => {
            if (!node.id) error('Tag node missing id');
            else tagIds.add(node.id);
            if (node.children) traverse(node.children);
        });
    }

    if (Array.isArray(tags)) traverse(tags);

    success(`Loaded ${tagIds.size} unique tags`);
    return tagIds;
}

async function validateQuestionIndex(validTagIds: Set<string>): Promise<Set<string>> {
    console.log('\n📁 Checking index.json (Question Index)...');
    const questions = await readJson<QuestionSummary[]>(join(ROOT_DIR, 'index.json'));
    if (!questions) return new Set();

    if (!Array.isArray(questions)) {
        error('index.json must be an array of QuestionSummary objects');
        return new Set();
    }

    const questionIds = new Set<string>();
    const paperIds = new Set<string>();
    const missingTagsSet = new Set<string>();

    questions.forEach((q, i) => {
        // Required: id, paperId, number, type, tags
        if (!q.id) error(`Question at index ${i} missing 'id'`);
        if (!q.paperId) error(`Question ${q.id || i} missing 'paperId'`);
        if (q.number === undefined) error(`Question ${q.id} missing 'number'`);
        if (!q.type) error(`Question ${q.id} missing 'type'`);

        if (questionIds.has(q.id)) error(`Duplicate Question ID: ${q.id}`);
        questionIds.add(q.id);
        if (q.paperId) paperIds.add(q.paperId);

        // Tag check (warn only for now, as tags might not be fully synced)
        if (q.tags) {
            q.tags.forEach(tag => {
                if (!validTagIds.has(tag) && !missingTagsSet.has(tag)) {
                    missingTagsSet.add(tag);
                }
            });
        }
    });

    if (missingTagsSet.size > 0) {
        warn(`${missingTagsSet.size} unique tag(s) referenced in questions but not in tags.json`);
        // Optionally list first few: console.log(Array.from(missingTagsSet).slice(0,5));
    }

    success(`Validated ${questions.length} question summaries across ${paperIds.size} papers`);
    return paperIds;
}

async function validatePaperDirectories(referencedPaperIds: Set<string>) {
    console.log('\n📁 Checking papers/ directory...');
    const papersDir = join(ROOT_DIR, 'papers');
    if (!(await exists(papersDir))) {
        error('papers/ directory not found');
        return;
    }

    const dirs = await readdir(papersDir);
    const existingPaperIds = new Set<string>();

    for (const dir of dirs) {
        const paperPath = join(papersDir, dir, 'index.json');
        if (!(await exists(paperPath))) {
            warn(`Directory '${dir}' exists but has no index.json`);
            continue;
        }

        const paperData = await readJson<PaperDetail>(paperPath);
        if (!paperData) continue;

        existingPaperIds.add(paperData.paperId);

        // Validate internal structure
        if (!paperData.paperId) error(`Paper in ${dir} missing paperId`);
        if (!paperData.questions || Object.keys(paperData.questions).length === 0) {
            warn(`Paper ${dir} has no questions`);
        }

        // Check question IDs match their keys
        for (const [key, q] of Object.entries(paperData.questions || {})) {
            if (q.id !== key) warn(`Question key '${key}' does not match id '${q.id}' in ${dir}`);
            if (q.paperId !== paperData.paperId) {
                error(`Question ${q.id} has mismatched paperId: ${q.paperId} != ${paperData.paperId}`);
            }
        }
    }

    // Cross-reference: Papers referenced in index.json should have directories
    for (const paperId of referencedPaperIds) {
        if (!existingPaperIds.has(paperId)) {
            warn(`Paper '${paperId}' referenced in index.json but no papers/${paperId}/ directory found`);
        }
    }

    // Cross-reference: Directories should have entries in index.json
    for (const paperId of existingPaperIds) {
        if (!referencedPaperIds.has(paperId)) {
            warn(`Paper '${paperId}' has directory but no questions in root index.json`);
        }
    }

    success(`Validated ${existingPaperIds.size} paper directories`);
}


// --- Main ---

async function main() {
    console.log('🚀 Starting Data Validation...');
    console.log(`   Root: ${ROOT_DIR}\n`);

    // 1. Validate static definitions
    const groupIds = await validatePaperGroups();
    const tagIds = await validateTags();

    // 2. Validate question index (the main data file)
    const referencedPaperIds = await validateQuestionIndex(tagIds);

    // 3. Validate paper directories (cross-reference)
    await validatePaperDirectories(referencedPaperIds);

    // Summary
    console.log('\n---');
    if (errorCount > 0) {
        console.error(`\n❌ Validation Failed: ${errorCount} error(s), ${warnCount} warning(s)`);
        process.exit(1);
    } else if (warnCount > 0) {
        console.log(`\n⚠️  Validation Passed with ${warnCount} warning(s)`);
        process.exit(0);
    } else {
        console.log('\n✨ Validation Passed!');
        process.exit(0);
    }
}

main();
