// Fix the remaining 6 validation warnings
import { readFile, writeFile } from 'fs/promises';

const filePath = 'papers/zhangyu-4-set1/index.json';

async function main() {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Q4: strategies formatting
    if (data.questions['zhangyu-4-set1-04']?.eureka?.strategies) {
        data.questions['zhangyu-4-set1-04'].eureka.strategies[0] = {
            title: "Taylor公式回忆",
            trigger: "看到**求高阶导数**",
            action: "写出**泰勒展开**，从系数提取导数值"
        };
    }

    // Q9: strategies[1] formatting
    if (data.questions['zhangyu-4-set1-09']?.eureka?.strategies) {
        data.questions['zhangyu-4-set1-09'].eureka.strategies[1] = {
            title: "收敛半径",
            trigger: "判断**幂级数收敛域**",
            action: "由 $\\rho = \\lim |\\frac{a_n}{a_{n+1}}|$ 得半径 $R$，检查端点"
        };
    }

    // Q15: strategies formatting
    if (data.questions['zhangyu-4-set1-15']?.eureka?.strategies) {
        data.questions['zhangyu-4-set1-15'].eureka.strategies[0] = {
            title: "特征方程",
            trigger: "求**特征值**",
            action: "解 $|A - \\lambda E| = 0$，得到所有**特征值**"
        };
        data.questions['zhangyu-4-set1-15'].eureka.strategies[1] = {
            title: "特征向量",
            trigger: "得到**特征值**后",
            action: "对每个 $\\lambda_i$，解 $(A - \\lambda_i E)\\vec{x} = 0$ 得**特征向量**"
        };
    }

    // Q20: diagnostic Unicode fix
    if (data.questions['zhangyu-4-set1-20']?.eureka?.diagnostic?.options) {
        data.questions['zhangyu-4-set1-20'].eureka.diagnostic.options[1].label =
            "不会用 $D(X) = E(X^2) - [E(X)]^2$";
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ Fixed all 6 remaining warnings');
}

main();
