
import { join } from 'path';
import {
    generatePaperDetail,
    createPaperFiles,
    generateQuestionSummaries,
    appendPaperGroup,
    appendToRootIndex,
} from './lib/generators';
import type { PaperGroup, PaperTemplate, QuestionStructure } from './lib/types';

const ROOT_DIR = process.cwd();

async function main() {
    console.log('Start generating SHU 836 2025 paper...');

    // 1. Define Paper Group
    const paperGroup: PaperGroup = {
        id: 'shu-836',
        name: '上海大学836自动控制原理',
        type: 'self_proposed',
        subjectKey: 'control-theory',
        university: '上海大学',
        courseCode: '836'
    };

    // 2. Define Paper Template
    const structure: QuestionStructure[] = [
        { type: 'answer', count: 5, scorePerQuestion: 10 }, // Q1-Q5: Modern Control (~50 pts total)
        { type: 'answer', count: 3, scorePerQuestion: 20 }, // Q6-Q8: Classical Control (~60 pts total)
        { type: 'answer', count: 1, scorePerQuestion: 40 }, // Q9: Discrete Control (40 pts)
    ];

    const totalScore = structure.reduce((sum, s) => sum + s.count * s.scorePerQuestion, 0);

    const template: PaperTemplate = {
        id: 'shu-836-template',
        name: 'SHU 836 Template',
        subjectKey: 'control-theory',
        structure,
        totalScore
    };

    const paperId = 'shu-836-2025';
    const year = 2025;
    const subjectKey = 'control-theory';

    // 3. Generate Paper Detail
    const paperDetail = generatePaperDetail(
        paperId,
        subjectKey,
        year,
        template,
        true // generateEureka
    );

    // 4. Create Files
    const result = await createPaperFiles(
        ROOT_DIR,
        paperId,
        paperDetail,
        true // createAssets
    );
    console.log(`Created paper files at: ${result.indexPath}`);

    // 5. Update Global Configs
    try {
        await appendPaperGroup(ROOT_DIR, paperGroup);
        console.log('Updated paperGroups.json');
    } catch (e) {
        console.log('Paper group might already exist, skipping.');
    }

    const summaries = generateQuestionSummaries(
        paperDetail,
        paperGroup.id,
        year
    );
    await appendToRootIndex(ROOT_DIR, summaries);
    console.log('Updated root index.json');

    console.log('Done!');
}

main().catch(console.error);
