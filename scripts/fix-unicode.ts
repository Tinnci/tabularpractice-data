// Script to automatically fix Unicode math symbols and add formatting
import { readFile, writeFile } from 'fs/promises';

const filePath = 'papers/zhangyu-4-set1/index.json';

// Unicode to LaTeX mapping
const unicodeToLatex: Record<string, string> = {
    '∫': '\\int',
    '∂': '\\partial',
    '∑': '\\sum',
    '∏': '\\prod',
    '√': '\\sqrt',
    '∞': '\\infty',
    '≈': '\\approx',
    '≠': '\\neq',
    '≤': '\\leq',
    '≥': '\\geq',
    '±': '\\pm',
    '×': '\\times',
    '÷': '\\div',
    'α': '\\alpha',
    'β': '\\beta',
    'λ': '\\lambda',
    'θ': '\\theta',
    'π': '\\pi',
    'Δ': '\\Delta',
    '→': '\\to',
    // Superscripts (common in matrices)
    'ᵀ': '^T',  // Transpose
    '²': '^2',
    '³': '^3',
    // Subscripts
    '₀': '_0',
    '₁': '_1',
    '₂': '_2',
    '₃': '_3'
};

function replaceUnicodeWithLatex(text: string): string {
    let result = text;

    // Replace Unicode symbols
    for (const [unicode, latex] of Object.entries(unicodeToLatex)) {
        if (result.includes(unicode)) {
            // Wrap in $ if not already
            const hasLatex = /\$.*?\$/.test(result);
            if (!hasLatex) {
                result = result.replace(new RegExp(unicode, 'g'), `$${latex}$`);
            } else {
                result = result.replace(new RegExp(unicode, 'g'), latex);
            }
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

        // Fix diagnostic
        if (q.eureka.diagnostic?.options) {
            q.eureka.diagnostic.options.forEach((opt: any) => {
                const oldHint = opt.hint;
                opt.hint = replaceUnicodeWithLatex(opt.hint);
                if (oldHint !== opt.hint) fixedCount++;
            });
        }

        // Fix modelLineup
        if (q.eureka.modelLineup?.options) {
            q.eureka.modelLineup.options.forEach((opt: any) => {
                if (opt.formula) {
                    const oldFormula = opt.formula;
                    opt.formula = replaceUnicodeWithLatex(opt.formula);
                    if (oldFormula !== opt.formula) fixedCount++;
                }
                if (opt.feedback) {
                    const oldFeedback = opt.feedback;
                    opt.feedback = replaceUnicodeWithLatex(opt.feedback);
                    if (oldFeedback !== opt.feedback) fixedCount++;
                }
            });
        }

        // Fix variableRoles
        if (q.eureka.variableRoles) {
            q.eureka.variableRoles.forEach((role: any) => {
                const oldSuggested = role.suggestedRole || '';
                const oldTransform = role.transformation || '';
                role.suggestedRole = replaceUnicodeWithLatex(role.suggestedRole || '');
                role.transformation = replaceUnicodeWithLatex(role.transformation || '');
                if (oldSuggested !== role.suggestedRole) fixedCount++;
                if (oldTransform !== role.transformation) fixedCount++;
            });
        }

        // Fix insight
        if (q.eureka.insight) {
            const oldInsight = q.eureka.insight;
            q.eureka.insight = replaceUnicodeWithLatex(q.eureka.insight);
            if (oldInsight !== q.eureka.insight) fixedCount++;
        }
    }

    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Fixed ${fixedCount} Unicode symbols`);
}

main();
