/**
 * 修复 tags.json 的层级结构
 * 添加三个顶级分类，并将现有标签归类到各自的父级下
 */

import fs from 'fs';
import path from 'path';

interface Tag {
    id: string;
    name: string;
    parentId: string | null;
}

// 三个顶级分类
const ROOT_CATEGORIES: Tag[] = [
    {
        id: 'advanced-math',
        name: '高等数学',
        parentId: null
    },
    {
        id: 'linear-algebra',
        name: '线性代数',
        parentId: null
    },
    {
        id: 'probability-statistics',
        name: '概率论与数理统计',
        parentId: null
    }
];

// 线性代数相关的标签
const LINEAR_ALGEBRA_TAGS = [
    'adjoint-inverse',
    'determinant',
    'eigenvalue',
    'eigenvalue-eigenvector',
    'inner-product',
    'linear-dependence',
    'linear-representation',
    'linear-system',
    'matrix',
    'matrix-diagonalization',
    'matrix-operation',
    'matrix-rank',
    'quadratic-form',
    'vector'
];

// 概率统计相关的标签
const PROBABILITY_STATISTICS_TAGS = [
    'confidence-interval',
    'covariance-correlation',
    'estimation-methods',
    'estimator-unbiased',
    'expectation-variance',
    'hypothesis-testing',
    'law-of-large-numbers',
    'marginal-conditional',
    'multidimensional-variable',
    'parameter-estimation',
    'random-event',
    'random-variable',
    'statistics-basic',
    'two-dimensional-variable'
];

// 其余的都是高等数学相关的标签

async function fixTagsHierarchy() {
    const tagsPath = path.join(process.cwd(), 'tags.json');

    // 读取现有的tags
    const content = fs.readFileSync(tagsPath, 'utf-8');
    const tags: Tag[] = JSON.parse(content);

    console.log(`📖 读取到 ${tags.length} 个标签`);

    // 更新parentId
    const updatedTags = tags.map(tag => {
        // 已经是顶级分类的，跳过
        if (ROOT_CATEGORIES.some(root => root.id === tag.id)) {
            return tag;
        }

        // 判断应该归属于哪个分类
        if (LINEAR_ALGEBRA_TAGS.includes(tag.id)) {
            return { ...tag, parentId: 'linear-algebra' };
        } else if (PROBABILITY_STATISTICS_TAGS.includes(tag.id)) {
            return { ...tag, parentId: 'probability-statistics' };
        } else {
            return { ...tag, parentId: 'advanced-math' };
        }
    });

    // 添加三个顶级分类（如果不存在）
    const finalTags = [
        ...ROOT_CATEGORIES,
        ...updatedTags.filter(tag => !ROOT_CATEGORIES.some(root => root.id === tag.id))
    ];

    // 按id排序，但保持根节点在前
    const sortedTags = [
        ...finalTags.filter(t => t.parentId === null).sort((a, b) => a.id.localeCompare(b.id)),
        ...finalTags.filter(t => t.parentId !== null).sort((a, b) => a.id.localeCompare(b.id))
    ];

    // 写回文件
    fs.writeFileSync(tagsPath, JSON.stringify(sortedTags, null, 2) + '\n', 'utf-8');

    console.log(`✅ 更新完成！`);
    console.log(`   - 高等数学: ${sortedTags.filter(t => t.parentId === 'advanced-math').length} 个子标签`);
    console.log(`   - 线性代数: ${sortedTags.filter(t => t.parentId === 'linear-algebra').length} 个子标签`);
    console.log(`   - 概率统计: ${sortedTags.filter(t => t.parentId === 'probability-statistics').length} 个子标签`);
}

fixTagsHierarchy().catch(console.error);
