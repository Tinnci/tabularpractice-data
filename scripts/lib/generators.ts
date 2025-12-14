/**
 * Paper skeleton generator
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import type {
    PaperDetail,
    Question,
    PaperTemplate,
    QuestionSummary,
    PaperGroup
} from './types';

// Format question number with leading zeros (01, 02, ..., 22)
export function formatQuestionNumber(num: number): string {
    return num.toString().padStart(2, '0');
}

// Generate a single question skeleton
export function generateQuestionSkeleton(
    paperId: string,
    number: number,
    type: 'choice' | 'fill' | 'answer',
    score: number,
    generateEureka: boolean = false
): Question {
    const formattedNum = formatQuestionNumber(number);
    const questionId = `${paperId}-${formattedNum}`;

    const question: Question = {
        id: questionId,
        paperId,
        number,
        type,
        tags: [],
        score,
        videoUrl: '',
        contentImg: `/papers/${paperId}/assets/${formattedNum}_q.png`,
        contentImgThumb: `/papers/${paperId}/assets/${formattedNum}_q_thumb.png`,
        analysisImg: `/papers/${paperId}/assets/${formattedNum}_a.png`,
        answerImg: null as unknown as string,
        contentMd: '',
        answerMd: '',
        analysisMd: '',
        answer: type === 'choice' ? '' : undefined,
    };

    if (generateEureka) {
        question.eureka = {
            diagnostic: {
                question: '你觉得卡在哪里了？',
                options: [],
            },
            variableRoles: [],
            strategies: [],
            insight: '',
        };
    }

    return question;
}

// Generate all questions for a paper based on template
export function generateAllQuestions(
    paperId: string,
    template: PaperTemplate,
    generateEureka: boolean = false
): Record<string, Question> {
    const questions: Record<string, Question> = {};
    let currentNumber = 1;

    for (const section of template.structure) {
        for (let i = 0; i < section.count; i++) {
            const question = generateQuestionSkeleton(
                paperId,
                currentNumber,
                section.type,
                section.scorePerQuestion,
                generateEureka
            );
            questions[question.id] = question;
            currentNumber++;
        }
    }

    return questions;
}

// Generate paper detail JSON structure
export function generatePaperDetail(
    paperId: string,
    subjectKey: string,
    year: number | string | undefined,
    template: PaperTemplate,
    generateEureka: boolean = false
): PaperDetail {
    return {
        paperId,
        subjectKey,
        year,
        questions: generateAllQuestions(paperId, template, generateEureka),
    };
}

// Generate question summaries for root index.json
export function generateQuestionSummaries(
    paperDetail: PaperDetail,
    category: string,
    year?: number
): QuestionSummary[] {
    return Object.values(paperDetail.questions).map(q => ({
        id: q.id,
        paperId: q.paperId,
        number: q.number,
        year: year,
        type: q.type,
        tags: q.tags,
        subject: paperDetail.subjectKey,
        category,
        contentImgThumb: q.contentImgThumb,
    }));
}

// Create paper directory and files
export async function createPaperFiles(
    rootDir: string,
    paperId: string,
    paperDetail: PaperDetail,
    createAssets: boolean = true
): Promise<{ paperDir: string; indexPath: string; assetsDir?: string }> {
    const paperDir = join(rootDir, 'papers', paperId);
    const indexPath = join(paperDir, 'index.json');
    const assetsDir = join(paperDir, 'assets');

    // Create paper directory
    await mkdir(paperDir, { recursive: true });

    // Write index.json
    await writeFile(
        indexPath,
        JSON.stringify(paperDetail, null, 2),
        'utf-8'
    );

    // Create assets directory if requested
    if (createAssets) {
        await mkdir(assetsDir, { recursive: true });

        // Create a README for assets naming convention
        const assetsReadme = `# 图片资源命名规范

## 文件命名

- \`01_q.png\` - 第1题题目图片
- \`01_q_thumb.png\` - 第1题题目缩略图 (400px width)
- \`01_a.png\` - 第1题解析图片
- \`01_ans.png\` - 第1题答案图片 (可选)

## 题目编号

${Object.values(paperDetail.questions)
                .map(q => `- 第${q.number}题: \`${formatQuestionNumber(q.number)}_q.png\`, \`${formatQuestionNumber(q.number)}_a.png\``)
                .join('\n')}
`;

        await writeFile(join(assetsDir, 'README.md'), assetsReadme, 'utf-8');

        return { paperDir, indexPath, assetsDir };
    }

    return { paperDir, indexPath };
}

// Generate paperId based on group and identifiers
export function generatePaperId(
    groupId: string,
    year?: number | string,
    set?: string
): string {
    if (set) {
        return `${groupId}-${set}`;
    }
    if (year) {
        return `${groupId}-${year}`;
    }
    return groupId;
}

// Append paper group to paperGroups.json
export async function appendPaperGroup(
    rootDir: string,
    newGroup: PaperGroup
): Promise<void> {
    const { readFile, writeFile } = await import('fs/promises');
    const paperGroupsPath = join(rootDir, 'paperGroups.json');

    const content = await readFile(paperGroupsPath, 'utf-8');
    const groups: PaperGroup[] = JSON.parse(content);

    // Check if group already exists
    if (groups.some(g => g.id === newGroup.id)) {
        throw new Error(`Paper group '${newGroup.id}' already exists`);
    }

    groups.push(newGroup);

    await writeFile(
        paperGroupsPath,
        JSON.stringify(groups, null, 4),
        'utf-8'
    );
}

// Append question summaries to root index.json
export async function appendToRootIndex(
    rootDir: string,
    summaries: QuestionSummary[]
): Promise<void> {
    const { readFile, writeFile } = await import('fs/promises');
    const indexPath = join(rootDir, 'index.json');

    const content = await readFile(indexPath, 'utf-8');
    const existingQuestions: QuestionSummary[] = JSON.parse(content);

    // Check for duplicates
    const existingIds = new Set(existingQuestions.map(q => q.id));
    const newSummaries = summaries.filter(s => !existingIds.has(s.id));

    if (newSummaries.length === 0) {
        console.log('All questions already exist in index.json, skipping.');
        return;
    }

    const allQuestions = [...existingQuestions, ...newSummaries];

    await writeFile(
        indexPath,
        JSON.stringify(allQuestions, null, 2),
        'utf-8'
    );
}
