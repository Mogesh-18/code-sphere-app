// ──────────────────────────────────────────────────
// Quiz System Types
// ──────────────────────────────────────────────────

export type QuestionType =
    | 'multiple-choice'    // Multiple correct answers
    | 'single-choice'      // One correct answer
    | 'fill-blank'         // Fill in the blank
    | 'code-output'        // What does this code output?
    | 'code-error'         // Find the bug
    | 'true-false'

export interface QuizOption {
    id: string
    text: string
    isCorrect: boolean
}

export interface BaseQuestion {
    id: string
    type: QuestionType
    question: string
    explanation: string
    difficulty: 'easy' | 'medium' | 'hard'
    tags: string[]
    points: number
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'multiple-choice'
    options: QuizOption[]
    minCorrect?: number
}

export interface SingleChoiceQuestion extends BaseQuestion {
    type: 'single-choice'
    options: QuizOption[]
}

export interface FillBlankQuestion extends BaseQuestion {
    type: 'fill-blank'
    codeSnippet?: string
    blanks: Array<{
        id: string
        acceptedAnswers: string[]
        caseSensitive?: boolean
    }>
}

export interface CodeOutputQuestion extends BaseQuestion {
    type: 'code-output'
    code: string
    language: string
    options: QuizOption[]
}

export interface TrueFalseQuestion extends BaseQuestion {
    type: 'true-false'
    answer: boolean
}

export type Question =
    | MultipleChoiceQuestion
    | SingleChoiceQuestion
    | FillBlankQuestion
    | CodeOutputQuestion
    | TrueFalseQuestion

export interface Quiz {
    id: string
    courseSlug: string
    chapterId?: string
    title: string
    description: string
    questions: Question[]
    timeLimit?: number  // seconds, undefined = no limit
    passingScore: number  // percentage 0-100
    shuffleQuestions: boolean
    shuffleOptions: boolean
    allowRetake: boolean
    showExplanations: boolean
}

export interface QuizSession {
    quizId: string
    startedAt: string
    currentQuestionIndex: number
    answers: Record<string, string | string[]>
    timeRemainingSeconds?: number
    isCompleted: boolean
    isPaused: boolean
}

export interface QuizResult {
    quizId: string
    score: number
    totalPoints: number
    earnedPoints: number
    correctCount: number
    totalCount: number
    passed: boolean
    timeSpentSeconds: number
    questionResults: Array<{
        questionId: string
        isCorrect: boolean
        userAnswer: string | string[]
        correctAnswer: string | string[]
        explanation: string
        points: number
        earnedPoints: number
    }>
}