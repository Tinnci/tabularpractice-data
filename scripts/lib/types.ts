/**
 * Core types for the paper creation script
 */

// Subject key for categorizing papers
export type SubjectKey = 'math' | 'english' | 'politics' | 'cs' | string;

// Question type
export type QuestionType = 'choice' | 'fill' | 'answer';

// Paper group type
export type PaperGroupType = 'unified' | 'self_proposed';

// Paper group definition (from paperGroups.json)
export interface PaperGroup {
    id: string;
    name: string;
    type: PaperGroupType;
    subjectKey: SubjectKey;
    university?: string;
    courseCode?: string;
}

// Tag definition (from tags.json)
export interface Tag {
    id: string;
    name: string;
    parentId: string | null;
    subjectKey?: SubjectKey;
    isRoot?: boolean;
}

// Question structure in a template
export interface QuestionStructure {
    type: QuestionType;
    count: number;
    scorePerQuestion: number;
}

// Paper template
export interface PaperTemplate {
    id: string;
    name: string;
    subjectKey: SubjectKey;
    structure: QuestionStructure[];
    totalScore: number;
}

// Eureka diagnostic option
export interface EurekaDiagnosticOption {
    type: 'representation' | 'function' | 'constraint' | 'analogy' | 'rule' | 'calculation';
    label: string;
    hint: string;
}

// Eureka model lineup option
export interface EurekaModelOption {
    id: string;
    label: string;
    formula?: string;
    isCorrect: boolean;
    feedback: string;
}

// Eureka variable role
export interface EurekaVariableRole {
    target: string;
    currentRole: string;
    suggestedRole: string;
    transformation: string;
}

// Eureka strategy
export interface EurekaStrategy {
    title: string;
    trigger: string;
    action: string;
}

// Eureka data structure
export interface EurekaData {
    diagnostic?: {
        question: string;
        options: EurekaDiagnosticOption[];
    };
    modelLineup?: {
        question: string;
        options: EurekaModelOption[];
    };
    variableRoles?: EurekaVariableRole[];
    strategies?: EurekaStrategy[];
    insight?: string;
}

// Question definition
export interface Question {
    id: string;
    paperId: string;
    number: number;
    type: QuestionType;
    tags: string[];
    score?: number;
    videoUrl?: string;
    contentImg?: string;
    contentImgThumb?: string;
    contentMd?: string;
    answerMd?: string;
    analysisMd?: string;
    analysisImg?: string;
    answerImg?: string;
    answer?: string;
    tagNames?: string[];
    eureka?: EurekaData;
}

// Paper detail (papers/*/index.json)
export interface PaperDetail {
    paperId: string;
    subjectKey?: SubjectKey;
    year?: string | number;
    tags?: string[];
    questions: Record<string, Question>;
}

// Question summary (root index.json)
export interface QuestionSummary {
    id: string;
    paperId: string;
    number: number;
    year?: number;
    type: QuestionType;
    tags: string[];
    subject?: string;
    category?: string;
    contentImgThumb?: string;
}

// User input for paper creation
export interface PaperCreationInput {
    subjectKey: SubjectKey;
    paperGroup: PaperGroup;
    paperId: string;
    year?: number | string;
    set?: string;
    template: PaperTemplate;
    createAssets: boolean;
    syncIndex: boolean;
    syncPaperGroups: boolean;
    generateEurekaSkeleton: boolean;
}
