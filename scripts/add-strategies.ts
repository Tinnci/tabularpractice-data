// Script to add strategies to all remaining questions
import { readFile, writeFile } from 'fs/promises';

const filePath = 'papers/zhangyu-4-set1/index.json';

const strategiesToAdd = {
    'zhangyu-4-set1-06': [
        {
            title: "隐函数定理",
            trigger: "看到 $F(x, y, z) = 0$ 确定 $z = z(x, y)$",
            action: "用公式 $\\frac{\\partial z}{\\partial x} = -\\frac{F_x}{F_z}$"
        },
        {
            title: "全微分公式",
            trigger: "求 $\\frac{dz}{dt}$ 且 $x, y$ 都是 $t$ 的函数",
            action: "用 $\\frac{dz}{dt} = \\frac{\\partial z}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial z}{\\partial y}\\frac{dy}{dt}$"
        }
    ],
    'zhangyu-4-set1-07': [
        {
            title: "驻点求解",
            trigger: "求**无条件极值**",
            action: "令 $\\frac{\\partial f}{\\partial x} = 0$, $\\frac{\\partial f}{\\partial y} = 0$"
        },
        {
            title: "Hessian判定",
            trigger: "得到驻点后",
            action: "计算 $A = f_{xx}$, $B = f_{xy}$, $C = f_{yy}$，用 $AC - B^2$ 判断"
        }
    ],
    'zhangyu-4-set1-08': [
        {
            title: "Gauss公式",
            trigger: "第二类曲面积分且**闭合曲面**",
            action: "用 $\\iint_S P\\,dy\\,dz = \\iiint_V \\frac{\\partial P}{\\partial x}\\,dV$"
        },
        {
            title: "散度计算",
            trigger: "转化为三重积分",
            action: "计算 $\\nabla \\cdot \\vec{F} = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}$"
        }
    ],
    'zhangyu-4-set1-09': [
        {
            title: "比值判别法",
            trigger: "看到级数通项含 $n!$ 或 $a^n$",
            action: "计算 $\\lim_{n\\to\\infty} |\\frac{u_{n+1}}{u_n}|$，小于1收敛"
        },
        {
            title: "收敛半径",
            trigger: "判断幂级数收敛域",
            action: "由 $\\rho = \\lim |\\frac{a_n}{a_{n+1}}|$ 得半径 $R$，检查端点"
        }
    ],
    'zhangyu-4-set1-10': [
        {
            title: "已知函数展开",
            trigger: "将已知函数展开为幂级数",
            action: "利用常见展开式（如 $e^x$, $\\ln(1+x)$），进行**变量替换**"
        },
        {
            title: "逐项求导/积分",
            trigger: "需要调整形式",
            action: "利用幂级数可**逐项求导**或**逐项积分**的性质"
        }
    ],
    'zhangyu-4-set1-11': [
        {
            title: "物理建模",
            trigger: "看到实际问题描述",
            action: "根据物理规律建立**微分方程**（如牛顿定律、衰变规律）"
        },
        {
            title: "特解求解",
            trigger: "建立方程后",
            action: "根据初始条件确定**特解**中的常数"
        }
    ],
    'zhangyu-4-set1-12': [
        {
            title: "行列式性质",
            trigger: "看到复杂行列式",
            action: "利用**性质化简**：提公因子、行列互换、加减消元"
        },
        {
            title: "按行展开",
            trigger: "化简后",
            action: "选择**零元素最多**的行或列展开计算"
        }
    ],
    'zhangyu-4-set1-13': [
        {
            title: "秩判断",
            trigger: "判断向量组线性相关性",
            action: "将向量组排成矩阵，计算**秩** $r$，若 $r <$ 向量个数则相关"
        },
        {
            title: "极大无关组",
            trigger: "需要找极大无关组",
            action: "保留**秩个线性无关向量**，其余向量可由它们线性表示"
        }
    ],
    'zhangyu-4-set1-15': [
        {
            title: "特征方程",
            trigger: "求特征值",
            action: "解 $|A - \\lambda E| = 0$，得到所有**特征值**"
        },
        {
            title: "特征向量",
            trigger: "得到特征值后",
            action: "对每个 $\\lambda_i$，解 $(A - \\lambda_i E)\\vec{x} = 0$ 得**特征向量**"
        }
    ],
    'zhangyu-4-set1-16': [
        {
            title: "配方法",
            trigger: "将二次型化为标准形",
            action: "**配方**消掉交叉项，得到 $\\sum \\lambda_i y_i^2$ 形式"
        },
        {
            title: "正交变换",
            trigger: "要求正交变换",
            action: "求矩阵的特征值，**正交化**特征向量得到 $P$"
        }
    ],
    'zhangyu-4-set1-18': [
        {
            title: "全概率公式",
            trigger: "事件 $A$ 可由**完备事件组** $B_i$ 划分",
            action: "用 $P(A) = \\sum P(B_i)P(A|B_i)$ 计算"
        },
        {
            title: "Bayes公式",
            trigger: "已知 $P(A)$ 求 $P(B_i|A)$",
            action: "用 $P(B_i|A) = \\frac{P(B_i)P(A|B_i)}{P(A)}$"
        }
    ],
    'zhangyu-4-set1-19': [
        {
            title: "分布函数法",
            trigger: "求 $Y = g(X)$ 的分布",
            action: "先求 $F_Y(y) = P(Y \\le y) = P(g(X) \\le y)$"
        },
        {
            title: "密度函数",
            trigger: "得到 $F_Y(y)$ 后",
            action: "对 $y$ **求导**得到密度函数 $f_Y(y) = F_Y'(y)$"
        }
    ],
    'zhangyu-4-set1-20': [
        {
            title: "期望定义",
            trigger: "求 $E(X)$",
            action: "离散用 $\\sum x_i p_i$，连续用 $\\int x f(x) dx$"
        },
        {
            title: "方差性质",
            trigger: "求 $D(X)$",
            action: "用 $D(X) = E(X^2) - [E(X)]^2$ 或性质 $D(aX+b) = a^2 D(X)$"
        }
    ],
    'zhangyu-4-set1-22': [
        {
            title: "矩估计",
            trigger: "用**样本矩**估计参数",
            action: "令样本均值 $\\bar{X} = E(X)$，解出参数"
        },
        {
            title: "极大似然",
            trigger: "写出**似然函数**",
            action: "对 $L(\\theta)$ 取对数，令 $\\frac{d\\ln L}{d\\theta} = 0$ 求极值"
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
        } else if (!question) {
            console.log(`⚠️  Question ${questionId} not found`);
        } else if (!question.eureka) {
            console.log(`⚠️  Question ${questionId} has no eureka field`);
        } else {
            console.log(`ℹ️  Question ${questionId} already has strategies`);
        }
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n📊 Total: ${modified} questions updated`);
}

main();
