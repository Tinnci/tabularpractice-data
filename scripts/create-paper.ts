#!/usr/bin/env bun
/**
 * Interactive Paper Creation Script
 * 
 * Usage: bun run create-paper
 * 
 * This script guides you through creating a new exam paper with:
 * - Subject selection
 * - Paper group selection/creation
 * - Paper ID generation
 * - Question structure template
 * - File generation
 */

import {
    intro,
    outro,
    select,
    text,
    confirm,
    isCancel,
    cancel,
    spinner,
    note,
    multiselect,
} from '@clack/prompts';
import * as pc from 'picocolors';

import type { PaperGroup, PaperTemplate, QuestionStructure } from './lib/types';
import { loadPaperGroups, loadTags, extractSubjectKeys, paperExists } from './lib/loaders';
import { TEMPLATES, getTemplatesForSubject, getSubjectDisplayName, KNOWN_SUBJECTS } from './lib/templates';
import {
    generatePaperId,
    generatePaperDetail,
    createPaperFiles,
    generateQuestionSummaries,
    appendPaperGroup,
    appendToRootIndex,
} from './lib/generators';

const ROOT_DIR = process.cwd();

// Handle user cancellation
function handleCancel(value: unknown): asserts value {
    if (isCancel(value)) {
        cancel('操作已取消');
        process.exit(0);
    }
}

// Main function
async function main() {
    console.clear();

    intro(pc.bgCyan(pc.black(' 📚 TabularPractice 试卷创建向导 ')));

    // Load existing data
    const s = spinner();
    s.start('正在加载配置...');

    let paperGroups: PaperGroup[];
    let tags: { id: string; name: string; parentId: string | null; subjectKey?: string; isRoot?: boolean }[];
    let existingSubjects: string[];

    try {
        paperGroups = await loadPaperGroups(ROOT_DIR);
        tags = await loadTags(ROOT_DIR);
        existingSubjects = extractSubjectKeys(tags);
        s.stop('配置加载完成');
    } catch (error) {
        s.stop('配置加载失败');
        cancel(`无法读取配置文件: ${error}`);
        process.exit(1);
    }

    // ========== Step 1: Select Subject ==========
    note('第 1 步：选择学科', '📔');

    const subjectOptions = [
        ...existingSubjects.map(s => ({
            value: s,
            label: getSubjectDisplayName(s),
        })),
        { value: '__new__', label: pc.cyan('➕ 新建学科...') },
    ];

    let subjectKey = await select({
        message: '选择学科',
        options: subjectOptions,
    });
    handleCancel(subjectKey);

    // Handle new subject creation
    if (subjectKey === '__new__') {
        const newSubjectKey = await text({
            message: '输入新学科的英文标识 (如: physics, chemistry)',
            placeholder: 'physics',
            validate: (value) => {
                if (!value) return '学科标识不能为空';
                if (!/^[a-z][a-z0-9-]*$/.test(value)) return '只能包含小写字母、数字和连字符';
                if (existingSubjects.includes(value)) return '该学科已存在';
                return undefined;
            },
        });
        handleCancel(newSubjectKey);
        subjectKey = newSubjectKey as string;

        note(`新学科 "${subjectKey}" 将在生成试卷时自动注册`, '💡');
    }

    // ========== Step 2: Select Paper Group ==========
    note('第 2 步：选择试卷组', '📁');

    // Filter paper groups by subject
    const relevantGroups = paperGroups.filter(g => g.subjectKey === subjectKey);

    const groupOptions = [
        ...relevantGroups.map(g => ({
            value: g.id,
            label: `📁 ${g.name} (${g.id})`,
            hint: g.type === 'unified' ? '统考' : '自命题',
        })),
        ...paperGroups.filter(g => g.subjectKey !== subjectKey).map(g => ({
            value: g.id,
            label: pc.dim(`📁 ${g.name} (${g.id})`),
            hint: `${getSubjectDisplayName(g.subjectKey)} - ${g.type === 'unified' ? '统考' : '自命题'}`,
        })),
        { value: '__new__', label: pc.cyan('➕ 新建试卷组...') },
    ];

    let selectedGroupId = await select({
        message: '选择试卷组',
        options: groupOptions,
    });
    handleCancel(selectedGroupId);

    let paperGroup: PaperGroup;

    // Handle new paper group creation
    if (selectedGroupId === '__new__') {
        const groupId = await text({
            message: '输入试卷组 ID (如: math2, zhangyu-8)',
            placeholder: 'zhangyu-8',
            validate: (value) => {
                if (!value) return 'ID 不能为空';
                if (!/^[a-z][a-z0-9-]*$/.test(value)) return '只能包含小写字母、数字和连字符';
                if (paperGroups.some(g => g.id === value)) return '该试卷组已存在';
                return undefined;
            },
        });
        handleCancel(groupId);

        const groupName = await text({
            message: '输入试卷组名称 (中文)',
            placeholder: '张宇八套卷',
        });
        handleCancel(groupName);

        const groupType = await select({
            message: '选择试卷类型',
            options: [
                { value: 'unified', label: '📋 统考试卷 (如考研真题、模拟题)' },
                { value: 'self_proposed', label: '🏫 自命题试卷 (如专业课)' },
            ],
        });
        handleCancel(groupType);

        paperGroup = {
            id: groupId as string,
            name: groupName as string,
            type: groupType as 'unified' | 'self_proposed',
            subjectKey: subjectKey as string,
        };

        // Ask about university for self-proposed
        if (groupType === 'self_proposed') {
            const university = await text({
                message: '输入学校名称 (可选)',
                placeholder: '上海大学',
            });
            if (!isCancel(university) && university) {
                paperGroup.university = university as string;
            }

            const courseCode = await text({
                message: '输入课程代码 (可选)',
                placeholder: '812',
            });
            if (!isCancel(courseCode) && courseCode) {
                paperGroup.courseCode = courseCode as string;
            }
        }
    } else {
        paperGroup = paperGroups.find(g => g.id === selectedGroupId)!;
    }

    // ========== Step 3: Paper ID Generation ==========
    note('第 3 步：生成试卷 ID', '🔖');

    const idType = await select({
        message: '试卷标识方式',
        options: [
            { value: 'year', label: '📅 按年份 (如 math1-2026)', hint: '适合真题' },
            { value: 'set', label: '📚 按套次 (如 zhangyu-4-set2)', hint: '适合模拟套卷' },
            { value: 'custom', label: '✏️ 自定义' },
        ],
    });
    handleCancel(idType);

    let year: number | undefined;
    let set: string | undefined;
    let paperId: string;

    if (idType === 'year') {
        const yearInput = await text({
            message: '输入年份',
            placeholder: new Date().getFullYear().toString(),
            initialValue: new Date().getFullYear().toString(),
            validate: (value) => {
                const y = parseInt(value);
                if (isNaN(y) || y < 1990 || y > 2100) return '请输入有效年份 (1990-2100)';
                return undefined;
            },
        });
        handleCancel(yearInput);
        year = parseInt(yearInput as string);
        paperId = generatePaperId(paperGroup.id, year);
    } else if (idType === 'set') {
        const setInput = await text({
            message: '输入套次标识 (如 set1, set2)',
            placeholder: 'set1',
            validate: (value) => {
                if (!value) return '套次不能为空';
                if (!/^[a-z][a-z0-9]*$/.test(value)) return '只能包含小写字母和数字';
                return undefined;
            },
        });
        handleCancel(setInput);
        set = setInput as string;
        paperId = generatePaperId(paperGroup.id, undefined, set);

        // Ask for year optionally
        const yearOptional = await text({
            message: '年份 (可选，按 Enter 跳过)',
            placeholder: '2026',
        });
        if (!isCancel(yearOptional) && yearOptional) {
            year = parseInt(yearOptional as string);
        }
    } else {
        const customId = await text({
            message: '输入自定义试卷 ID',
            placeholder: `${paperGroup.id}-custom`,
            validate: (value) => {
                if (!value) return 'ID 不能为空';
                if (!/^[a-z][a-z0-9-]*$/.test(value)) return '只能包含小写字母、数字和连字符';
                return undefined;
            },
        });
        handleCancel(customId);
        paperId = customId as string;
    }

    // Check if paper already exists
    if (await paperExists(ROOT_DIR, paperId)) {
        const overwrite = await confirm({
            message: pc.yellow(`试卷 "${paperId}" 已存在，是否覆盖？`),
            initialValue: false,
        });
        handleCancel(overwrite);
        if (!overwrite) {
            cancel('操作已取消');
            process.exit(0);
        }
    }

    // ========== Step 4: Question Structure Template ==========
    note('第 4 步：选择题目结构模板', '📝');

    const templateOptions = getTemplatesForSubject(subjectKey as string);

    let selectedTemplate = await select({
        message: '选择题目结构模板',
        options: templateOptions.map(t => ({
            value: t.id,
            label: t.name,
            hint: t.id !== 'custom'
                ? `共 ${t.structure.reduce((sum, s) => sum + s.count, 0)} 题，${t.totalScore} 分`
                : undefined,
        })),
    });
    handleCancel(selectedTemplate);

    let template: PaperTemplate;

    if (selectedTemplate === 'custom') {
        // Custom template input
        const structure: QuestionStructure[] = [];

        const choiceCount = await text({
            message: '选择题数量',
            placeholder: '10',
            initialValue: '10',
        });
        handleCancel(choiceCount);
        if (parseInt(choiceCount as string) > 0) {
            const choiceScore = await text({
                message: '每道选择题分值',
                placeholder: '5',
                initialValue: '5',
            });
            handleCancel(choiceScore);
            structure.push({
                type: 'choice',
                count: parseInt(choiceCount as string),
                scorePerQuestion: parseInt(choiceScore as string),
            });
        }

        const fillCount = await text({
            message: '填空题数量',
            placeholder: '6',
            initialValue: '6',
        });
        handleCancel(fillCount);
        if (parseInt(fillCount as string) > 0) {
            const fillScore = await text({
                message: '每道填空题分值',
                placeholder: '5',
                initialValue: '5',
            });
            handleCancel(fillScore);
            structure.push({
                type: 'fill',
                count: parseInt(fillCount as string),
                scorePerQuestion: parseInt(fillScore as string),
            });
        }

        const answerCount = await text({
            message: '解答题数量',
            placeholder: '6',
            initialValue: '6',
        });
        handleCancel(answerCount);
        if (parseInt(answerCount as string) > 0) {
            const answerScore = await text({
                message: '每道解答题分值',
                placeholder: '10',
                initialValue: '10',
            });
            handleCancel(answerScore);
            structure.push({
                type: 'answer',
                count: parseInt(answerCount as string),
                scorePerQuestion: parseInt(answerScore as string),
            });
        }

        const totalScore = structure.reduce((sum, s) => sum + s.count * s.scorePerQuestion, 0);

        template = {
            id: 'custom',
            name: '自定义模板',
            subjectKey: subjectKey as string,
            structure,
            totalScore,
        };
    } else {
        template = templateOptions.find(t => t.id === selectedTemplate)!;
    }

    // ========== Step 5: Generation Options ==========
    note('第 5 步：选择生成选项', '⚙️');

    const options = await multiselect({
        message: '选择要执行的操作',
        options: [
            { value: 'assets', label: '📁 创建 assets/ 目录', hint: '存放题目图片' },
            { value: 'syncIndex', label: '📋 同步更新 index.json', hint: '将题目添加到全局索引' },
            { value: 'syncGroups', label: '📚 同步更新 paperGroups.json', hint: '如果是新建的试卷组' },
            { value: 'eureka', label: '🧠 生成 eureka 骨架', hint: '认知脚手架结构' },
        ],
        initialValues: ['assets'],
    });
    handleCancel(options);

    const createAssets = (options as string[]).includes('assets');
    const syncIndex = (options as string[]).includes('syncIndex');
    const syncGroups = (options as string[]).includes('syncGroups');
    const generateEureka = (options as string[]).includes('eureka');

    // ========== Summary and Confirmation ==========
    const totalQuestions = template.structure.reduce((sum, s) => sum + s.count, 0);

    const summaryText = `
${pc.bold('试卷信息:')}
  学科: ${getSubjectDisplayName(subjectKey as string)}
  试卷组: ${paperGroup.name} (${paperGroup.id})
  试卷 ID: ${pc.cyan(paperId)}
  年份: ${year || '未指定'}

${pc.bold('题目结构:')}
${template.structure.map(s => `  ${s.type === 'choice' ? '选择题' : s.type === 'fill' ? '填空题' : '解答题'}: ${s.count} 题 × ${s.scorePerQuestion} 分`).join('\n')}
  总计: ${totalQuestions} 题，${template.totalScore} 分

${pc.bold('生成选项:')}
  创建 assets/: ${createAssets ? '✅' : '❌'}
  同步 index.json: ${syncIndex ? '✅' : '❌'}
  同步 paperGroups.json: ${syncGroups ? '✅' : '❌'}
  生成 eureka 骨架: ${generateEureka ? '✅' : '❌'}
`;

    note(summaryText, '📋 确认信息');

    const confirmed = await confirm({
        message: '确认创建试卷？',
        initialValue: true,
    });
    handleCancel(confirmed);

    if (!confirmed) {
        cancel('操作已取消');
        process.exit(0);
    }

    // ========== Execute Generation ==========
    s.start('正在生成试卷...');

    try {
        // Generate paper detail
        const paperDetail = generatePaperDetail(
            paperId,
            subjectKey as string,
            year,
            template,
            generateEureka
        );

        // Create files
        const result = await createPaperFiles(
            ROOT_DIR,
            paperId,
            paperDetail,
            createAssets
        );

        // Sync paper groups if requested and new group was created
        if (syncGroups && selectedGroupId === '__new__') {
            await appendPaperGroup(ROOT_DIR, paperGroup);
        }

        // Sync root index if requested
        if (syncIndex) {
            const summaries = generateQuestionSummaries(
                paperDetail,
                paperGroup.id,
                year
            );
            await appendToRootIndex(ROOT_DIR, summaries);
        }

        s.stop('试卷生成完成！');

        // Final output
        const finalNote = `
${pc.green('✅ 试卷创建成功！')}

${pc.bold('生成的文件:')}
  📄 ${result.indexPath}
  ${result.assetsDir ? `📁 ${result.assetsDir}` : ''}

${pc.bold('下一步:')}
  1. 将题目图片放入 papers/${paperId}/assets/ 目录
  2. 编辑 papers/${paperId}/index.json 填写题目内容
  3. 运行 ${pc.cyan('bun run validate')} 验证数据

${pc.dim('提示: 图片命名规范见 assets/README.md')}
`;

        note(finalNote, '🎉');

    } catch (error) {
        s.stop('生成失败');
        cancel(`生成过程中出错: ${error}`);
        process.exit(1);
    }

    outro(pc.bgGreen(pc.black(' Happy Coding! ')));
}

// Run
main().catch(console.error);
