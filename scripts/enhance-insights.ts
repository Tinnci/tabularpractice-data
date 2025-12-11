// Add bold formatting to insight fields
import { readFile, writeFile } from 'fs/promises';

const filePath = 'papers/zhangyu-4-set1/index.json';

function addFormatting(text: string): string {
    if (!text) return text;

    // Add bold to key math terms
    const keyTerms = [
        '变上限积分', '被积函数', '主部', '阶数',
        '特征方程', '纯虚根', '周期解', '简谐振动',
        '交换次序', '积分区域', '被积函数',
        '齐次化', '变量替换', '可分离变量',
        '隐函数定理', '全微分',
        '驻点', 'Hessian', '极值',
        'Gauss公式', '散度',
        '比值判别法', '收敛半径',
        '幂级数', '泰勒展开',
        '特征值', '特征向量', '对角化',
        '二次型', '正定', '合同',
        '全概率公式', 'Bayes',
        '分布函数', '密度函数',
        '期望', '方差',
        '矩估计', '极大似然'
    ];

    let result = text;
    for (const term of keyTerms) {
        // Only add bold if not already formatted
        if (!result.includes(`**${term}**`) && !result.includes(`$`)) {
            result = result.replace(new RegExp(term, 'g'), `**${term}**`);
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
        if (q.eureka?.insight) {
            const oldInsight = q.eureka.insight;
            q.eureka.insight = addFormatting(q.eureka.insight);
            if (oldInsight !== q.eureka.insight) {
                fixedCount++;
                console.log(`✅ Enhanced insight for ${q.id}`);
            }
        }
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n📊 Total: ${fixedCount} insights enhanced`);
}

main();
