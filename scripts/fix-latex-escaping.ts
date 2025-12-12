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
            if (original.includes('\\\\\\\\')) {
                // This means JSON source has 8 backslashes, which becomes 4 in runtime
                // Fix: reduce 4 runtime backslashes to 2
                const fixed = original.replace(/\\\\\\\\/g, '\\\\');

                if (fixed !== original) {
                    role.transformation = fixed;
                    fixCount++;
                    fixes.push(`  ${qId}.eureka.variableRoles[${idx}].transformation`);

                    console.log(`\n✏️  Fixing ${qId} variableRoles[${idx}]:`);
                    console.log(`   Before (runtime): ${original.substring(0, 80)}...`);
                    console.log(`   After  (runtime): ${fixed.substring(0, 80)}...`);
                }
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
