// Script to add strategies to remaining questions
import { readFile, writeFile } from 'fs/promises';

const filePath = 'papers/zhangyu-4-set1/index.json';

const strategiesToAdd = {
    'zhangyu-4-set1-02': [
        {
            title: "特征方程分析",
            trigger: "看到 $y'' + ay' + by = 0$ 且要求**必为周期函数**",
            action: "写出特征方程 $r^2 + ar + b = 0$，明确周期解对应**纯虚根**"
        },
        {
            title: "韦达定理判断",
            trigger: "特征根必须为 $r = \\pm \\omega i$",
            action: "利用 **$r_1 + r_2 = -a$** 和 **$r_1 r_2 = b$**，得出 $a=0$ 且 $b > 0$"
        }
    ],
    'zhangyu-4-set1-04': [
        {
            title: "Taylor公式回忆",
            trigger: "看到求高阶导数",
            action: "写出泰勒展开，从系数提取导数值"
        }
    ],
    'zhangyu-4-set1-05': [
        {
            title: "三角代换",
            trigger: "看到 $\\sqrt{a^2 - x^2}$",
            action: "令 $x = a\\sin t$，变换积分限"
        }
    ]
};

async function main() {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    let modified = 0;

    for (const [questionId, strategies] of Object.entries(strategiesToAdd)) {
        const question = data.questions[questionId];
        if (question && question.eureka && !question.eureka.strategies) {
            question.eureka.strategies = strategies;
            modified++;
            console.log(`✅ Added strategies to ${questionId}`);
        }
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n📊 Total: ${modified} questions updated`);
}

main();
