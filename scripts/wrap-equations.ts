// Advanced LaTeX wrapper - handles full mathematical expressions
import { readFile, writeFile } from 'fs/promises';

const filePath = 'papers/zhangyu-4-set1/index.json';

function wrapMathExpressions(text: string): string {
    if (!text) return text;

    let result = text;

    // Pattern 1: Mathematical expressions with = sign and LaTeX syntax
    // Examples: "Q^T AQ = B", "P^T AP = B", "y = x_1 + x_2"
    const equationPattern = /([A-Za-z0-9_^+\-*/\s()[\]{}]+[=<>≤≥][A-Za-z0-9_^+\-*/\s()[\]{}]+)/g;

    result = result.replace(equationPattern, (match) => {
        // Only wrap if it contains LaTeX syntax (^, _) and is not already wrapped
        if (/[_^]/.test(match)) {
            // Check if already in $...$
            const textBeforeMatch = result.substring(0, result.indexOf(match));
            const dollarsBeforeCount = (textBeforeMatch.match(/\$/g) || []).length;

            if (dollarsBeforeCount % 2 === 0) {
                // Not inside $...$, wrap it
                return `$${match.trim()}$`;
            }
        }
        return match;
    });

    // Pattern 2: Common mathematical notations in parentheses
    // Examples: "（Q^T AQ = B）", "（P^T AP = B）"
    const parenEquationPattern = /（([^）]+[_^][^）]+)）/g;
    result = result.replace(parenEquationPattern, (match, inner) => {
        if (/[=<>≤≥]/.test(inner)) {
            // Check if already wrapped
            const textBeforeMatch = result.substring(0, result.indexOf(match));
            const dollarsBeforeCount = (textBeforeMatch.match(/\$/g) || []).length;

            if (dollarsBeforeCount % 2 === 0) {
                return `（$${inner.trim()}$）`;
            }
        }
        return match;
    });

    return result;
}

async function main() {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    let fixedCount = 0;

    for (const question of Object.values(data.questions)) {
        const q = question as any;
        if (!q.eureka) continue;

        // Fix diagnostic hints
        if (q.eureka.diagnostic?.options) {
            q.eureka.diagnostic.options.forEach((opt: any) => {
                if (opt.hint) {
                    const oldHint = opt.hint;
                    opt.hint = wrapMathExpressions(opt.hint);
                    if (oldHint !== opt.hint) {
                        fixedCount++;
                        console.log(`✅ Fixed hint in ${q.id}: ${oldHint.substring(0, 50)}...`);
                    }
                }
            });
        }

        // Fix modelLineup feedback
        if (q.eureka.modelLineup?.options) {
            q.eureka.modelLineup.options.forEach((opt: any) => {
                if (opt.feedback) {
                    const oldFeedback = opt.feedback;
                    opt.feedback = wrapMathExpressions(opt.feedback);
                    if (oldFeedback !== opt.feedback) {
                        fixedCount++;
                        console.log(`✅ Fixed feedback in ${q.id}`);
                    }
                }
            });
        }

        // Fix variableRoles
        if (q.eureka.variableRoles) {
            q.eureka.variableRoles.forEach((role: any) => {
                ['currentRole', 'suggestedRole', 'transformation'].forEach(field => {
                    if (role[field]) {
                        const old = role[field];
                        role[field] = wrapMathExpressions(role[field]);
                        if (old !== role[field]) fixedCount++;
                    }
                });
            });
        }
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n📊 Total: ${fixedCount} math expressions wrapped`);
}

main();
