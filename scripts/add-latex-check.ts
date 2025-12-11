// Add LaTeX syntax check to validate.ts
import { readFile, writeFile } from 'fs/promises';

const filePath = 'scripts/validate.ts';

async function main() {
    let content = await readFile(filePath, 'utf-8');

    // Find the checkField function and add the new check
    const searchPattern = `        // Check for Unicode math symbols
        if (unicodeMathSymbols.test(fieldValue)) {
            warn(\`\${paperId}/\${question.id} \${fieldPath} uses Unicode math symbols. Use LaTeX ($...$) instead.\`);
        }
        
        // Check for lack of formatting`;

    const replacement = `        // Check for Unicode math symbols
        if (unicodeMathSymbols.test(fieldValue)) {
            warn(\`\${paperId}/\${question.id} \${fieldPath} uses Unicode math symbols. Use LaTeX ($...$) instead.\`);
        }
        
        // Check for LaTeX syntax outside $ delimiters (e.g., A^T, x_i)
        const latexSyntax = /[_^\\\\]/;
        if (latexSyntax.test(fieldValue)) {
            const outsideLatex = fieldValue.replace(/\\$[^$]*\\$/g, '');
            if (latexSyntax.test(outsideLatex)) {
                warn(\`\${paperId}/\${question.id} \${fieldPath} has LaTeX syntax (^, _, \\\\) outside $...$ delimiters.\`);
            }
        }
        
        // Check for lack of formatting`;

    content = content.replace(searchPattern, replacement);

    await writeFile(filePath, content, 'utf-8');
    console.log('✅ Added LaTeX syntax check to validate.ts');
}

main();
