/**
 * 批量更新 tags.json，添加 subjectKey 和 isRoot 字段
 * 实现方案A：数据驱动的多科目支持
 */

import fs from 'fs';
import path from 'path';

interface FlatTag {
    id: string;
    name: string;
    parentId: string | null;
    subjectKey?: string;
    isRoot?: boolean;
}

// 科目配置：定义每个科目的根节点
const SUBJECT_CONFIG: Record<string, string[]> = {
    math: ['advanced-math', 'linear-algebra', 'probability-statistics'],
    english: ['vocabulary-grammar', 'reading-comprehension', 'cloze-test', 'writing'],
    politics: ['marxism', 'mao-theory', 'modern-history', 'morality-law', 'current-affairs']
};

// 反向映射：根节点ID -> 科目
const ROOT_TO_SUBJECT = new Map<string, string>();
Object.entries(SUBJECT_CONFIG).forEach(([subject, roots]) => {
    roots.forEach(rootId => ROOT_TO_SUBJECT.set(rootId, subject));
});

async function migrateTagsToDataDriven() {
    const tagsPath = path.join(process.cwd(), 'tags.json');

    // 读取现有数据
    const content = fs.readFileSync(tagsPath, 'utf-8');
    const tags: FlatTag[] = JSON.parse(content);

    console.log(`📖 读取到 ${tags.length} 个标签`);

    // 统计
    let rootCount = 0;
    const subjectStats: Record<string, number> = {};

    // 更新标签
    const updatedTags = tags.map(tag => {
        // 检查是否是根节点
        const subjectKey = ROOT_TO_SUBJECT.get(tag.id);

        if (subjectKey) {
            rootCount++;
            subjectStats[subjectKey] = (subjectStats[subjectKey] || 0) + 1;

            return {
                ...tag,
                subjectKey,
                isRoot: true
            };
        }

        // 非根节点保持不变
        return tag;
    });

    // 写回文件
    fs.writeFileSync(tagsPath, JSON.stringify(updatedTags, null, 2) + '\n', 'utf-8');

    console.log(`\n✅ 迁移完成！`);
    console.log(`   - 总标签数: ${tags.length}`);
    console.log(`   - 根节点数: ${rootCount}`);
    console.log(`\n📊 科目分布:`);
    Object.entries(subjectStats).forEach(([subject, count]) => {
        console.log(`   - ${subject}: ${count} 个根节点`);
    });

    // 验证
    console.log(`\n🔍 验证结果...`);
    const verified = JSON.parse(fs.readFileSync(tagsPath, 'utf-8')) as FlatTag[];
    const rootsWithSubject = verified.filter(t => t.isRoot && t.subjectKey);
    console.log(`   - 带 subjectKey 的根节点: ${rootsWithSubject.length}`);

    if (rootsWithSubject.length === rootCount) {
        console.log(`   ✅ 验证通过！`);
    } else {
        console.log(`   ❌ 验证失败，请检查！`);
    }
}

migrateTagsToDataDriven().catch(console.error);
