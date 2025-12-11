// Final pass: enhance remaining insights
import { readFile, writeFile } from 'fs/promises';

const filePath = 'papers/zhangyu-4-set1/index.json';

const insightEnhancements: Record<string, string> = {
    'zhangyu-4-set1-03': '遇到 e^(y/x) 或 sin(x^2) 这种基本**函数**积不出来的情况，首先想到**交换积分次序**！',
    'zhangyu-4-set1-04': 'Taylor公式：n 阶**导数**的值隐藏在 $(x-x_0)^n$ 项的**系数**里，只需乘以 $n!$ 提取。',
    'zhangyu-4-set1-05': '三角代换核心：将 **$\\sqrt{a^2-x^2}$** 转化为 $a\\cos t$，从**根号**下解放！',
    'zhangyu-4-set1-06': '**隐函数定理**是求偏导神器。记住 $\\frac{\\partial z}{\\partial x} = -\\frac{F_x}{F_z}$，**链式法则**是组合技。',
    'zhangyu-4-set1-07': '无条件**极值**三步走：**驻点** → **Hessian** → **判定**。$AC - B^2$ 是关键。',
    'zhangyu-4-set1-09': '级数**收敛**判断：看到 $n!$ 或 $a^n$，首选**比值判别法**。',
    'zhangyu-4-set1-11': '物理建模 → **微分方程** → 特解。初始条件确定**常数**！',
    'zhangyu-4-set1-12': '**行列式**计算艺术：先用性质简化，再选择零最多的行展开。',
    'zhangyu-4-set1-13': '**向量组**线性相关性 = 秩判断。$r <$ 向量个数 → 线性相关。',
    'zhangyu-4-set1-14': '一阶齐次**方程**：看到 $(ax+by+c)$ 就想到**平移坐标系**！',
    'zhangyu-4-set1-15': '**特征值**问题：解 $|A - \\lambda E| = 0$ 得特征值，再解方程组得**特征向量**。',
    'zhangyu-4-set1-16': '**二次型**标准化：配方法消交叉项，或用正交变换对角化。',
    'zhangyu-4-set1-17': '**全微分**还原：对 $x$ 积分 $P$ 得 $z = \\int P dx + \\varphi(y)$，再用 $Q$ 确定 $\\varphi(y)$。',
    'zhangyu-4-set1-18': '**概率**组合拳：全概率公式求 $P(A)$，Bayes公式求 $P(B_i|A)$。',
    'zhangyu-4-set1-19': '随机**变量**函数分布：先求 $F_Y(y) = P(Y \\le y)$，再对 $y$ 求导得密度。',
    'zhangyu-4-set1-20': '数字特征：**期望**用定义积分，**方差**用 $D(X) = E(X^2) - [E(X)]^2$。',
    'zhangyu-4-set1-21': '**矩阵**相似与合同：相似看特征值，合同看正定性。正交相似要求**迹**相等。',
    'zhangyu-4-set1-22': '**参数估计**：矩估计（样本矩=总体矩），极大似然（似然**函数**求极值）。'
};

async function main() {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    let fixedCount = 0;

    for (const [questionId, enhancedInsight] of Object.entries(insightEnhancements)) {
        const question = data.questions[questionId];
        if (question?.eureka) {
            question.eureka.insight = enhancedInsight;
            fixedCount++;
            console.log(`✅ ${questionId}`);
        }
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n📊 Enhanced ${fixedCount} insights`);
}

main();
