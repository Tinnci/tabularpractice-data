/**
 * 标签迁移脚本
 * 将所有标签统一为标准英文 ID 格式
 * 运行方式: bun run scripts/migrate-tags.ts
 */

// 完整的标签映射表：旧格式 → 标准格式
const TAG_MIGRATION_MAP: Record<string, string> = {
    // ========== 拼音格式 → 标准格式 ==========
    // 函数、极限、连续
    "han-shu-ji-xian-lian-xu": "limit-continuity",
    "shu-lie-lian-san-xing-de-pan-ding": "sequence-convergence",
    "han-shu-ji-xian-de-ji-suan": "limit-calculation",
    "que-ding-ji-xian-zhong-de-can-shu": "limit-parameter",
    "wu-qiong-xiao-liang-de-bi-jiao": "infinitesimal-comparison",
    "han-shu-de-lian-xu-xing": "function-continuity",
    "han-shu-de-qi-ou-xing-yu-zhou-qi-xing": "function-parity-periodicity",

    // 一元函数微分学
    "dao-shu-yu-wei-fen-de-gai-nian": "derivative-concept",
    "dao-shu-yu-wei-fen-de-ji-suan": "derivative-calculation",
    "dao-shu-de-ji-he-yi-yi": "derivative-geometry",
    "han-shu-de-dan-diao-xing-ji-zhi-yu-zui-zhi": "monotonicity-extremum",
    "qu-xian-de-ao-tu-xing-guai-dian-ji-jian-jin-xian": "concavity-asymptote",
    "fang-cheng-gen-de-cun-zai-xing-yu-ge-shu": "equation-roots",
    "bu-deng-shi-de-zheng-ming": "inequality-proof",
    "wei-fen-zhong-zhi-ding-li": "mean-value-theorem",
    "tai-le-gong-shi": "taylor-formula",

    // 一元函数积分学
    "bu-ding-ji-fen-de-ji-suan": "indefinite-integral",
    "ding-ji-fen-de-gai-nian-xing-zhi-ji-ji-he-yi-yi": "definite-integral-concept",
    "ding-ji-fen-de-ji-suan": "definite-integral-calculation",
    "bian-xian-ji-fen": "variable-limit-integral",
    "fan-chang-ji-fen-de-ji-suan-yu-lian-san-xing": "improper-integral",
    "ding-ji-fen-de-ying-yong": "definite-integral-application",

    // 多元函数微分学
    "pian-dao-shu-de-gai-nian-yu-ji-suan": "partial-derivative",
    "quan-wei-fen-de-gai-nian-yu-ji-suan": "total-differential",
    "duo-yuan-han-shu-wei-fen-xue-de-ji-he-ying-yong": "multivariable-geometry",
    "fang-xiang-dao-shu-he-ti-du": "directional-derivative",
    "duo-yuan-han-shu-de-ji-zhi-wen-ti": "multivariable-extremum",

    // 多元函数积分学
    "zhong-ji-fen-de-gai-nian-yu-xing-zhi": "multiple-integral-concept",
    "jiao-huan-ji-fen-ci-xu-yu-zuo-biao-xi-zhi-jian-de-zhuan-hua": "integral-order-transform",
    "zhong-ji-fen-de-ji-suan": "multiple-integral-calculation",
    "zhong-ji-fen-de-ying-yong": "multiple-integral-application",
    "di-yi-lei-qu-xian-ji-fen": "line-integral-type1",
    "di-er-lei-qu-xian-ji-fen": "line-integral-type2",
    "di-yi-lei-qu-mian-ji-fen": "surface-integral-type1",
    "di-er-lei-qu-mian-ji-fen": "surface-integral-type2",
    "xuan-du-de-ding-yi": "curl-definition",

    // 无穷级数
    "chang-shu-xiang-ji-shu-lian-san-xing-de-pan-ding": "series-convergence",
    "qiu-mi-ji-shu-de-shou-lian-ban-jing-shou-lian-qu-jian-he-shou-lian-yu": "power-series-radius",
    "mi-ji-shu-de-he-han-shu-ji-mi-ji-shu-zhan-kai-shi": "power-series-sum",
    "fu-li-ye-ji-shu": "fourier-series",

    // 常微分方程
    "xian-xing-wei-fen-fang-cheng-de-jie-de-jie-gou": "linear-solution-structure",
    "ke-fen-li-bian-liang-de-wei-fen-fang-cheng-yu-qi-ci-fang-cheng": "separable-homogeneous",
    "yi-jie-fei-qi-ci-xian-xing-wei-fen-fang-cheng": "first-order-nonhomogeneous",
    "chang-xi-shu-qi-ci-xian-xing-wei-fen-fang-cheng": "constant-coefficient-homogeneous",
    "chang-xi-shu-fei-qi-ci-xian-xing-wei-fen-fang-cheng": "constant-coefficient-nonhomogeneous",
    "qi-ta-fang-cheng": "other-equations",
    "wei-fen-fang-cheng-de-ying-yong": "differential-equation-application",

    // 线性代数
    "xing-lie-shi": "determinant",
    "ju-zhen-de-yun-suan-yu-bian-huan": "matrix-operation",
    "ban-sui-ju-zhen-yu-ke-ni-ju-zhen": "adjoint-inverse",
    "ju-zhen-de-zhi": "matrix-rank",
    "xiang-liang-zu-de-xian-xing-xiang-guan-xing": "linear-dependence",
    "xiang-liang-zu-zhi-jian-de-xian-xing-biao-shi": "linear-representation",
    "xiang-liang-nei-ji-yu-xiang-liang-zheng-jiao": "inner-product",
    "xian-xing-fang-cheng-zu": "linear-system",
    "te-zheng-zhi-yu-te-zheng-xiang-liang": "eigenvalue-eigenvector",
    "ju-zhen-de-xiang-si-yu-xiang-si-dui-jiao-hua": "matrix-diagonalization",
    "er-ci-xing": "quadratic-form",

    // 概率论
    "sui-ji-shi-jian-he-gai-lv": "random-event",
    "sui-ji-bian-liang-ji-qi-fen-bu": "random-variable",
    "er-wei-sui-ji-bian-liang-ji-qi-fen-bu": "two-dimensional-variable",
    "bian-yuan-fen-bu-he-tiao-jian-fen-bu": "marginal-conditional",
    "shu-xue-qi-wang-yu-fang-cha": "expectation-variance",
    "xie-fang-cha-yu-xiang-guan-xi-shu": "covariance-correlation",
    "da-shu-ding-lv-he-zhong-xin-ji-xian-ding-li": "law-of-large-numbers",
    "shu-li-tong-ji-de-ji-ben-gai-nian": "statistics-basic",
    "gu-ji-liang-de-wu-pian-xing": "estimator-unbiased",
    "ju-gu-ji-he-zui-da-si-ran-gu-ji": "estimation-methods",
    "qu-jian-gu-ji-he-zhi-xin-qu-jian": "confidence-interval",
    "jia-she-jian-yan": "hypothesis-testing",

    // ========== 英文简称/下划线格式 → 标准格式 ==========
    // 基础标签
    "limit": "limit-calculation",
    "infinitesimal": "infinitesimal-comparison",
    "derivative": "derivative-calculation",
    "asymptote": "concavity-asymptote",
    "gradient": "directional-derivative",
    "function_limits": "limit-calculation",

    // 微分方程
    "differential_equation": "differential-equation",
    "periodic_function": "function-parity-periodicity",
    "exact_equation": "other-equations",
    "linear_equation": "first-order-nonhomogeneous",
    "piecewise_function": "function-continuity",

    // 积分
    "double_integral": "multiple-integral-calculation",
    "change_of_order": "integral-order-transform",
    "surface_integral": "surface-integral-type2",
    "gauss_theorem": "multiple-integral-application",
    "integral_mean_value": "mean-value-theorem",
    "intermediate_value_theorem": "mean-value-theorem",
    "calculus_proof": "inequality-proof",

    // 级数
    "infinite_series": "series-convergence",
    "summation": "power-series-sum",
    "taylor_expansion": "taylor-formula",

    // 多元微分
    "multivariable_calculus": "multivariable-extremum",
    "total_differential": "total-differential",
    "extrema": "multivariable-extremum",

    // 线性代数
    "linear_algebra": "linear-algebra",
    "vectors": "vector",
    "linear_dependence": "linear-dependence",
    "homogeneous_equations": "linear-system",
    "adjoint_matrix": "adjoint-inverse",
    "eigenvalues": "eigenvalue-eigenvector",
    "stochastic_matrix": "matrix-operation",
    "matrix_similarity": "matrix-diagonalization",
    "diagonalization": "matrix-diagonalization",
    "orthogonal_matrix": "matrix-diagonalization",
    "system_of_equations": "linear-system",
    "matrix_operations": "matrix-operation",

    // 概率统计
    "probability": "random-event",
    "correlation_coefficient": "covariance-correlation",
    "multinomial_distribution": "random-variable",
    "hypothesis_testing": "hypothesis-testing",
    "type_ii_error": "hypothesis-testing",
    "estimator": "estimator-unbiased",
    "efficiency": "estimator-unbiased",
    "maximum_likelihood": "estimation-methods",
    "parameter_estimation": "estimation-methods",
    "joint_distribution": "two-dimensional-variable",
    "independence": "marginal-conditional",
    "conditional_probability": "marginal-conditional",
};

// 标准 ID 集合（用于验证）
const STANDARD_IDS = new Set([
    // 高等数学
    "advanced-math", "limit-continuity", "sequence-convergence", "limit-calculation",
    "limit-parameter", "infinitesimal-comparison", "function-continuity", "function-parity-periodicity",
    "differential-calculus", "derivative-concept", "derivative-calculation", "derivative-geometry",
    "monotonicity-extremum", "concavity-asymptote", "equation-roots", "inequality-proof",
    "mean-value-theorem", "taylor-formula",
    "integral-calculus", "indefinite-integral", "definite-integral-concept", "definite-integral-calculation",
    "variable-limit-integral", "improper-integral", "definite-integral-application",
    "multivariable-differential", "partial-derivative", "total-differential", "multivariable-geometry",
    "directional-derivative", "multivariable-extremum",
    "multivariable-integral", "multiple-integral-concept", "integral-order-transform",
    "multiple-integral-calculation", "multiple-integral-application",
    "line-integral-type1", "line-integral-type2", "surface-integral-type1", "surface-integral-type2", "curl-definition",
    "infinite-series", "series-convergence", "power-series-radius", "power-series-sum", "fourier-series",
    "differential-equation", "linear-solution-structure", "separable-homogeneous",
    "first-order-nonhomogeneous", "constant-coefficient-homogeneous", "constant-coefficient-nonhomogeneous",
    "other-equations", "differential-equation-application",
    // 线性代数
    "linear-algebra", "determinant", "matrix", "matrix-operation", "adjoint-inverse", "matrix-rank",
    "vector", "linear-dependence", "linear-representation", "inner-product", "linear-system",
    "eigenvalue-eigenvector", "matrix-diagonalization", "quadratic-form",
    // 概率统计
    "probability-statistics", "random-event", "random-variable", "multidimensional-variable",
    "two-dimensional-variable", "marginal-conditional", "numerical-characteristics",
    "expectation-variance", "covariance-correlation", "law-of-large-numbers",
    "statistics-basic", "parameter-estimation", "estimator-unbiased", "estimation-methods",
    "confidence-interval", "hypothesis-testing"
]);

function migrateTag(oldTag: string): string {
    // 如果已经是标准 ID，直接返回
    if (STANDARD_IDS.has(oldTag)) {
        return oldTag;
    }
    // 查找映射
    const mapped = TAG_MIGRATION_MAP[oldTag];
    if (mapped) {
        return mapped;
    }
    // 未知标签，返回原值并警告
    console.warn(`⚠️  未知标签: "${oldTag}"`);
    return oldTag;
}

async function main() {
    console.log("🚀 开始迁移标签...\n");

    // 1. 读取 index.json
    const indexPath = "./index.json";
    const data = await Bun.file(indexPath).json();
    console.log(`📖 读取了 ${data.length} 道题目\n`);

    // 2. 统计和迁移
    const stats = { total: 0, migrated: 0, unchanged: 0, unknown: 0 };
    const unknownTags = new Set<string>();

    for (const question of data) {
        if (!question.tags) continue;

        question.tags = question.tags.map((tag: string) => {
            stats.total++;
            const newTag = migrateTag(tag);

            if (newTag !== tag) {
                if (TAG_MIGRATION_MAP[tag]) {
                    stats.migrated++;
                } else {
                    stats.unknown++;
                    unknownTags.add(tag);
                }
            } else {
                stats.unchanged++;
            }

            return newTag;
        });
    }

    // 3. 输出统计
    console.log("📊 迁移统计:");
    console.log(`   总标签数: ${stats.total}`);
    console.log(`   已迁移: ${stats.migrated}`);
    console.log(`   无需变更: ${stats.unchanged}`);
    console.log(`   未知标签: ${stats.unknown}`);

    if (unknownTags.size > 0) {
        console.log("\n⚠️  未知标签列表:");
        [...unknownTags].sort().forEach(t => console.log(`   - ${t}`));
    }

    // 4. 写回文件
    await Bun.write(indexPath, JSON.stringify(data, null, 2));
    console.log("\n✅ 已保存到 index.json");
}

main().catch(console.error);
