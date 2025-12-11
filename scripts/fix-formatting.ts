// Fix formatting warnings in strategies
import { readFile, writeFile } from 'fs/promises';

const filePath = 'papers/zhangyu-4-set1/index.json';

async function main() {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Q8 strategy[1].trigger
    if (data.questions['zhangyu-4-set1-08']?.eureka?.strategies?.[1]) {
        data.questions['zhangyu-4-set1-08'].eureka.strategies[1].trigger = "**转化为三重积分**";
    }

    // Q10 strategy[0].trigger
    if (data.questions['zhangyu-4-set1-10']?.eureka?.strategies?.[0]) {
        data.questions['zhangyu-4-set1-10'].eureka.strategies[0].trigger = "将**已知函数**展开为幂级数";
    }

    // Q11 strategy[1].trigger
    if (data.questions['zhangyu-4-set1-11']?.eureka?.strategies?.[1]) {
        data.questions['zhangyu-4-set1-11'].eureka.strategies[1].trigger = "**建立方程后**";
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ Fixed 3 formatting warnings');
}

main();
