// Comprehensive formatting enhancement for all remaining eureka fields
import { readFile, writeFile } from 'fs/promises';

const filePath = 'papers/zhangyu-4-set1/index.json';

function enhanceText(text: string, fieldType: 'label' | 'hint' | 'feedback' | 'role' | 'transformation'): string {
    if (!text || text.includes('**') || text.includes('$')) {
        // Already formatted or has LaTeX
        return text;
    }

    // Keywords that should be bold
    const boldKeywords = [
        '函数', '方程', '矩阵', '变量', '积分', '导数', '极限', '收敛',
        '特征值', '概率', '区域', '阶数', '公式',
        '无法', '不会', '忘记', '搞混', '卡住', '不熟悉',
        '看到', '试着', '尝试', '利用', '代入', '求解', '计算'
    ];

    let result = text;

    // Add bold to first occurrence of key terms
    for (const keyword of boldKeywords) {
        if (result.includes(keyword) && !result.includes(`**${keyword}**`)) {
            result = result.replace(keyword, `**${keyword}**`);
            break; // Only one keyword per field
        }
    }

    return result;
}

async function main() {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    let fixedCount = 0;

    for (const question of Object.values(data.questions)) {
        const q = question as any;
        if (!q.eureka) continue;

        // Enhance diagnostic
        if (q.eureka.diagnostic?.options) {
            q.eureka.diagnostic.options.forEach((opt: any) => {
                const oldLabel = opt.label;
                const oldHint = opt.hint;
                opt.label = enhanceText(opt.label, 'label');
                opt.hint = enhanceText(opt.hint, 'hint');
                if (oldLabel !== opt.label) fixedCount++;
                if (oldHint !== opt.hint) fixedCount++;
            });
        }

        // Enhance modelLineup
        if (q.eureka.modelLineup?.options) {
            q.eureka.modelLineup.options.forEach((opt: any) => {
                const oldLabel = opt.label;
                const oldFeedback = opt.feedback;
                opt.label = enhanceText(opt.label, 'label');
                opt.feedback = enhanceText(opt.feedback, 'feedback');
                if (oldLabel !== opt.label) fixedCount++;
                if (oldFeedback !== opt.feedback) fixedCount++;
            });
        }

        // Enhance variableRoles
        if (q.eureka.variableRoles) {
            q.eureka.variableRoles.forEach((role: any) => {
                const oldCurrent = role.currentRole;
                const oldSuggested = role.suggestedRole;
                const oldTransform = role.transformation;

                role.currentRole = enhanceText(role.currentRole || '', 'role');
                role.suggestedRole = enhanceText(role.suggestedRole || '', 'role');
                role.transformation = enhanceText(role.transformation || '', 'transformation');

                if (oldCurrent !== role.currentRole) fixedCount++;
                if (oldSuggested !== role.suggestedRole) fixedCount++;
                if (oldTransform !== role.transformation) fixedCount++;
            });
        }
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Enhanced ${fixedCount} fields`);
}

main();
