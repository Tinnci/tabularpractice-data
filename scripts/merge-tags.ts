import { readFile, writeFile } from 'fs/promises';

async function main() {
    const existing = JSON.parse(await readFile('tags.json', 'utf-8'));
    const newTags = JSON.parse(await readFile('missing-tags-generated.json', 'utf-8'));

    const merged = [...existing, ...newTags];

    await writeFile('tags.json', JSON.stringify(merged, null, 2));

    console.log(`✅ Merged ${newTags.length} new tags into tags.json`);
    console.log(`📊 Total tags: ${merged.length} (was ${existing.length})`);
}

main();
