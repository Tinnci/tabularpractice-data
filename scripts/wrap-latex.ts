// Script to wrap naked LaTeX syntax in $ delimiters
import { readFile, writeFile } from 'fs/promises';

const filePath = 'papers/zhangyu-4-set1/index.json';

function wrapLatexSyntax(text: string): string {
    if (!text) return text;

    // Pattern to match LaTeX-like patterns NOT already in $...$
    // This is a simple heuristic: look for patterns like A^T, x_i, \sum, etc.

    let result = text;

    // Common patterns that should be wrapped:
    // 1. Letter/word followed by ^T, ^2, etc.
    const superscriptPattern = /(\b[A-Za-z]+)\^([A-Za-z0-9]+)/g;
    result = result.replace(superscriptPattern, (match, base, sup) => {
        // Check if already in $...$
        const index = text.indexOf(match);
        const before = text.substring(0, index);
        const afterLastDollar = before.lastIndexOf('$');
        const dollarCount = (before.match(/\$/g) || []).length;

        // If odd number of $, we're inside a LaTeX block
        if (dollarCount % 2 === 1) {
            return match;
        }

        return `$${base}^${sup}$`;
    });

    // 2. Letter/word followed by _i, _0, etc.
    const subscriptPattern = /(\b[A-Za-z]+)_([A-Za-z0-9]+)/g;
    result = result.replace(subscriptPattern, (match, base, sub) => {
        const index = text.indexOf(match);
        const before = text.substring(0, index);
        const dollarCount = (before.match(/\$/g) || []).length;

        if (dollarCount % 2 === 1) {
            return match;
        }

        return `$${base}_${sub}$`;
    });

    // 3. Greek letters with backslash
    const greekPattern = /\\(alpha|beta|gamma|delta|theta|lambda|pi|sigma|omega)/g;
    result = result.replace(greekPattern, (match) => {
        const index = text.indexOf(match);
        const before = text.substring(0, index);
        const dollarCount = (before.match(/\$/g) || []).length;

        if (dollarCount % 2 === 1) {
            return match;
        }

        return `$${match}$`;
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

        // Fix modelLineup formulas
        if (q.eureka.modelLineup?.options) {
            q.eureka.modelLineup.options.forEach((opt: any) => {
                if (opt.formula) {
                    const oldFormula = opt.formula;
                    opt.formula = wrapLatexSyntax(opt.formula);
                    if (oldFormula !== opt.formula) {
                        fixedCount++;
                        console.log(`✅ Fixed formula in ${q.id}: ${oldFormula} → ${opt.formula}`);
                    }
                }
            });
        }

        // Fix other fields that might have naked LaTeX
        if (q.eureka.variableRoles) {
            q.eureka.variableRoles.forEach((role: any) => {
                ['target', 'currentRole', 'suggestedRole', 'transformation'].forEach(field => {
                    if (role[field]) {
                        const old = role[field];
                        role[field] = wrapLatexSyntax(role[field]);
                        if (old !== role[field]) fixedCount++;
                    }
                });
            });
        }
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n📊 Total: ${fixedCount} LaTeX syntax blocks wrapped`);
}

main();
