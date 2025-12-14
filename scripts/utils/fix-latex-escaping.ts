import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Question {
    id: string;
    eureka?: {
        variableRoles?: Array<{
            transformation: string;
            [key: string]: any;
        }>;
        [key: string]: any;
    };
    [key: string]: any;
}

interface PaperData {
    paperId: string;
    questions: Record<string, Question>;
    [key: string]: any;
}

function fixLatexEscaping(paperId: string = 'zhangyu-4-set1') {
    const filePath = join(process.cwd(), 'papers', paperId, 'index.json');
    console.log(`📝 Reading ${filePath}...`);

    const content = readFileSync(filePath, 'utf-8');
    const data: PaperData = JSON.parse(content);

    let fixCount = 0;
    const fixes: string[] = [];

    for (const [qId, question] of Object.entries(data.questions)) {
        if (!question.eureka?.variableRoles) continue;

        question.eureka.variableRoles.forEach((role, idx) => {
            const original = role.transformation;

            // In JSON source, \\\\\\\\ (8 backslashes) becomes \\\\ in runtime
            // We need \\\\ in JSON source to get \\ in runtime (which KaTeX needs)
            // So we replace runtime \\\\ with \\

            // Check if transformation contains problematic patterns in runtime
            let fixed = role.transformation;
            let modified = false;

            // 1. Fix over-escaped line breaks: \\\\\\\\ (8 backslashes in JSON) -> \\\\ (4 backslashes in JSON)
            // Runtime: \\\\ -> \\
            if (fixed.includes('\\\\\\\\')) {
                fixed = fixed.replace(/\\\\\\\\/g, '\\\\');
                modified = true;
            }

            // 2. Fix over-escaped commands: \\\\begin (4 backslashes in JSON) -> \\begin (2 backslashes in JSON)
            // Runtime: \\begin -> \begin
            // Check for patterns like \\begin, \\end, \\frac which indicate over-escaping
            if (/\\\\(begin|end|frac|pmatrix|cases)/.test(fixed)) {
                fixed = fixed.replace(/\\\\(begin|end|frac|pmatrix|cases)/g, '\\$1');
                modified = true;
            }

            if (modified) {
                role.transformation = fixed;
                fixCount++;
                fixes.push(`  ${qId}.eureka.variableRoles[${idx}].transformation`);

                console.log(`\n✏️  Fixing ${qId} variableRoles[${idx}]:`);
                console.log(`   Before (runtime): ${original.substring(0, 80)}...`);
                console.log(`   After  (runtime): ${fixed.substring(0, 80)}...`);
            }
        });
    }

    if (fixCount > 0) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`✅ Fixed ${fixCount} field(s):`);
        fixes.forEach(fix => console.log(fix));

        // Write back with proper formatting
        console.log(`\n💾 Writing changes to ${filePath}...`);
        writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log('✅ File updated successfully!');
    } else {
        console.log('\n✨ No issues found - all LaTeX escaping is correct!');
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('📋 Summary:');
    console.log(`${'='.repeat(80)}`);
    console.log(`
Correct LaTeX escaping in JSON:
  \\\\begin{cases}     → Runtime: \\begin{cases}  → KaTeX: \\begin{cases}
  \\\\ (line break)   → Runtime: \\             → KaTeX: newline
  
After fix:
  - cases/pmatrix environments should now render with proper line breaks
  - No more literal \\\\ displayed in the output
`);
}

// Run the fix
fixLatexEscaping();
