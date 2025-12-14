/**
 * Predefined paper templates
 */

import type { PaperTemplate } from './types';

// Math exam template (考研数学真题)
export const MATH_EXAM_TEMPLATE: PaperTemplate = {
    id: 'math-exam',
    name: '数学真题 (选择10 + 填空6 + 解答6)',
    subjectKey: 'math',
    structure: [
        { type: 'choice', count: 10, scorePerQuestion: 5 },
        { type: 'fill', count: 6, scorePerQuestion: 5 },
        { type: 'answer', count: 6, scorePerQuestion: 10 },
    ],
    totalScore: 150,
};

// Math mock template (考研数学模拟题)
export const MATH_MOCK_TEMPLATE: PaperTemplate = {
    id: 'math-mock',
    name: '数学模拟 (选择10 + 填空6 + 解答6)',
    subjectKey: 'math',
    structure: [
        { type: 'choice', count: 10, scorePerQuestion: 5 },
        { type: 'fill', count: 6, scorePerQuestion: 5 },
        { type: 'answer', count: 6, scorePerQuestion: 10 },
    ],
    totalScore: 150,
};

// English exam template (考研英语真题) - simplified
export const ENGLISH_EXAM_TEMPLATE: PaperTemplate = {
    id: 'english-exam',
    name: '英语真题 (完形20 + 阅读20 + 翻译 + 写作)',
    subjectKey: 'english',
    structure: [
        { type: 'choice', count: 20, scorePerQuestion: 0.5 }, // 完形填空
        { type: 'choice', count: 20, scorePerQuestion: 2 },   // 阅读理解
        { type: 'answer', count: 5, scorePerQuestion: 2 },    // 翻译
        { type: 'answer', count: 2, scorePerQuestion: 15 },   // 写作
    ],
    totalScore: 100,
};

// Custom template (blank)
export const CUSTOM_TEMPLATE: PaperTemplate = {
    id: 'custom',
    name: '自定义 (手动输入题目数量)',
    subjectKey: 'math',
    structure: [],
    totalScore: 0,
};

// All available templates
export const TEMPLATES: PaperTemplate[] = [
    MATH_EXAM_TEMPLATE,
    MATH_MOCK_TEMPLATE,
    ENGLISH_EXAM_TEMPLATE,
    CUSTOM_TEMPLATE,
];

// Get templates for a specific subject
export function getTemplatesForSubject(subjectKey: string): PaperTemplate[] {
    return TEMPLATES.filter(t => t.subjectKey === subjectKey || t.id === 'custom');
}

// Known subjects with display names
export const KNOWN_SUBJECTS: Record<string, string> = {
    math: '🧮 数学',
    english: '📖 英语',
    politics: '📜 政治',
    cs: '💻 计算机',
};

// Get subject display name
export function getSubjectDisplayName(subjectKey: string): string {
    return KNOWN_SUBJECTS[subjectKey] || `📚 ${subjectKey}`;
}
