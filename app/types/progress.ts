// ──────────────────────────────────────────────────
// Progress Tracking Types
// All progress is stored locally (localStorage) with
// optional server sync in future versions.
// ──────────────────────────────────────────────────

export interface SectionProgress {
    sectionId: string
    courseSlug: string
    chapterSlug: string
    completedAt: string  // ISO date
    timeSpentSeconds: number
}

export interface ChapterProgress {
    chapterSlug: string
    courseSlug: string
    completedSections: string[]  // section IDs
    totalSections: number
    startedAt: string
    completedAt?: string
}

export interface CourseProgress {
    courseSlug: string
    startedAt: string
    completedAt?: string
    lastAccessedAt: string
    lastSectionId?: string
    lastChapterSlug?: string
    completedSectionIds: string[]
    totalSections: number
    completionPercentage: number
    totalTimeSpentSeconds: number
}

export interface QuizAttempt {
    id: string
    courseSlug: string
    chapterId?: string
    score: number
    totalQuestions: number
    correctAnswers: number
    completedAt: string
    timeSpentSeconds: number
    answers: Record<string, string | string[]>
}

export interface LearningStreak {
    currentStreak: number
    longestStreak: number
    lastActivityDate: string  // ISO date (YYYY-MM-DD)
    activeDays: string[]      // ISO dates
}

export interface LearningStats {
    totalCoursesStarted: number
    totalCoursesCompleted: number
    totalSectionsCompleted: number
    totalTimeSpentSeconds: number
    totalQuizzesTaken: number
    averageQuizScore: number
    streak: LearningStreak
    joinedAt: string
}

export interface ProgressStore {
    // Per-course progress map
    courses: Record<string, CourseProgress>
    // Per-section timestamps
    sections: Record<string, SectionProgress>
    // Quiz history
    quizAttempts: QuizAttempt[]
    // Aggregate stats
    stats: LearningStats
    // Schema version for migrations
    version: number
}

export interface ContinueLearning {
    courseSlug: string
    courseTitle: string
    courseIcon: string
    chapterSlug: string
    sectionId: string
    sectionTitle: string
    completionPercentage: number
    lastAccessedAt: string
}