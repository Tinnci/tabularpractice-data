import { readFileSync } from 'fs';
import { join } from 'path';

interface EurekaData {
    diagnostic?: {
        question: string;
        options: Array<{
            type: string;
            label: string;
            hint: string;
        }>;
    };
    modelLineup?: {
        question: string;
        options: Array<{
            id: string;
            label: string;
            formula?: string;
            isCorrect: boolean;
            feedback: string;
        }>;
    };
    variableRoles?: Array<{
        target: string;
        currentRole: string;
        suggestedRole: string;
        transformation: string;
    }>;
    strategies?: Array<{
        title: string;
        trigger: string;
        action: string;
    }>;
    insight?: string;
}

interface Question {
    id: string;
    paperId: string;
    eureka?: EurekaData;
}

interface PaperData {
    paperId: string;
    questions: Record<string, Question>;
}

// Simulate MarkdownContent's smartFormatContent
function smartFormatContent(content: string): string {
    if (!content) return "";
    const trimmed = content.trim();

    if (trimmed.startsWith('$$') || trimmed.startsWith('$')) {
        return content;
    }

    if (trimmed.includes('\\begin{') && !trimmed.includes('$')) {
        return `$$\n${trimmed}\n$$`;
    }

    return content;
}

function analyzeLatexEscaping(questionId: string, paperId: string = 'zhangyu-4-set1') {
    const filePath = join(process.cwd(), 'papers', paperId, 'index.json');
    const data: PaperData = JSON.parse(readFileSync(filePath, 'utf-8'));

    const question = data.questions[questionId];
    if (!question?.eureka?.variableRoles) {
        console.log('❌ No variableRoles found');
        return;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 Analyzing ${questionId}`);
    console.log(`${'='.repeat(80)}\n`);

    question.eureka.variableRoles.forEach((role, idx) => {
        const trans = role.transformation;

        console.log(`\n--- VariableRole[${idx}] ---`);
        console.log(`Target: ${role.target}`);
        console.log(`\nTransformation field:`);
        console.log(`  Length: ${trans.length} chars`);
        console.log(`  Preview: ${trans.substring(0, 100)}...`);

        // Analyze backslash patterns
        const backslashPattern = /\\+/g;
        const matches = [...trans.matchAll(backslashPattern)];

        console.log(`\n  Backslash sequences: ${matches.length}`);
        matches.forEach((m, i) => {
            if (i < 5) {
                const before = trans.substring(Math.max(0, m.index! - 8), m.index);
                const after = trans.substring(m.index! + m[0].length, m.index! + m[0].length + 8);
                console.log(`    ${i + 1}. Length ${m[0].length}: ...${before}[${m[0]}]${after}...`);
            }
        });

        // Check for specific issues
        const issues: string[] = [];

        if (trans.includes('\\\\\\\\begin') || trans.includes('\\\\\\\\end')) {
            issues.push('❌ Found \\\\\\\\begin or \\\\\\\\end (should be \\\\begin, \\\\end)');
        }

        // In JS runtime, \\\\\\\\ (8 backslashes in JSON) becomes \\\\ (4 backslashes)
        // For LaTeX line break, we want \\ in output, which is \\\\ in JSON source
        const hasQuadrupleBackslash = /\\\\\\\\/.test(trans);
        if (hasQuadrupleBackslash) {
            issues.push('⚠️  Found \\\\\\\\ (4 backslashes in runtime) - might render as \\\\ instead of line break');
        }

        // Simulate rendering
        console.log(`\n  Simulated render:`);
        const processed = smartFormatContent(trans);
        console.log(`    After smartFormatContent: ${processed.substring(0, 80)}...`);

        // Extract LaTeX blocks
        const latexMatches = processed.match(/\$\$?[^$]+\$\$?/g);
        if (latexMatches) {
            console.log(`\n  LaTeX blocks (${latexMatches.length}):`);
            latexMatches.forEach((latex, i) => {
                if (i < 2) {
                    console.log(`    ${i + 1}. ${latex.substring(0, 60)}...`);
                    // Check if cases/pmatrix line breaks will work
                    if (latex.includes('\\\\\\\\')) {
                        issues.push(`⚠️  LaTeX block ${i + 1} contains \\\\\\\\ - KaTeX might not parse this correctly`);
                    }
                }
            });
        }

        if (issues.length > 0) {
            console.log(`\n  ⚠️  Issues found:`);
            issues.forEach(issue => console.log(`    ${issue}`));
        } else {
            console.log(`\n  ✅ No obvious issues detected`);
        }
    });
}

// Run analysis
analyzeLatexEscaping('zhangyu-4-set1-21');

console.log(`\n${'='.repeat(80)}`);
console.log('💡 Summary:');
console.log(`${'='.repeat(80)}`);
console.log(`
In JSON source:
  \\\\begin{cases}  → Runtime: \\begin{cases}  ✅ Correct
  \\\\\\\\          → Runtime: \\\\            ✅ Correct (LaTeX line break)
  
If you see rendering issues, check:
  1. KaTeX configuration in MarkdownContent.tsx
  2. remark-math and rehype-katex versions
  3. Whether smartFormatContent is interfering with inline LaTeX
`);
