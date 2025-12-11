import { readFile } from 'fs/promises';
import { join } from 'path';

const ROOT_DIR = process.cwd();

interface Tag {
    id: string;
    label?: string;
    name?: string;
    children?: Tag[];
}

interface QuestionSummary {
    id: string;
    tags: string[];
}

async function main() {
    // Load tags.json
    const tagsContent = await readFile(join(ROOT_DIR, 'tags.json'), 'utf-8');
    const tags: Tag[] = JSON.parse(tagsContent);

    const tagIds = new Set<string>();
    function collectTagIds(tagList: Tag[]) {
        tagList.forEach(tag => {
            tagIds.add(tag.id);
            if (tag.children) collectTagIds(tag.children);
        });
    }
    collectTagIds(tags);

    // Load index.json
    const indexContent = await readFile(join(ROOT_DIR, 'index.json'), 'utf-8');
    const questions: QuestionSummary[] = JSON.parse(indexContent);

    const referencedTags = new Set<string>();
    questions.forEach(q => {
        q.tags?.forEach(tag => referencedTags.add(tag));
    });

    // Find missing
    const missing = Array.from(referencedTags).filter(tag => !tagIds.has(tag));

    console.log(`Total tags in tags.json: ${tagIds.size}`);
    console.log(`Total unique tags referenced: ${referencedTags.size}`);
    console.log(`Missing tags: ${missing.length}\n`);

    if (missing.length > 0) {
        console.log('Missing tag IDs:');
        missing.sort().forEach(tag => console.log(`  - ${tag}`));
    }
}

main();
