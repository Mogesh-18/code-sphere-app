/**
 * Progress Store
 *
 * Client-side learning progress tracked in localStorage.
 * Uses Zustand for reactive state management.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { format, parseISO, isToday, isYesterday, differenceInCalendarDays } from 'date-fns'
import type {
    ProgressStore,
    CourseProgress,
    SectionProgress,
    QuizAttempt,
    LearningStats,
    ContinueLearning,
} from '@/types/progress'

const STORE_VERSION = 1

const initialStats: LearningStats = {
    totalCoursesStarted: 0,
    totalCoursesCompleted: 0,
    totalSectionsCompleted: 0,
    totalTimeSpentSeconds: 0,
    totalQuizzesTaken: 0,
    averageQuizScore: 0,
    streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: '',
        activeDays: [],
    },
    joinedAt: new Date().toISOString(),
}

interface ProgressActions {
    // Course
    startCourse: (courseSlug: string, totalSections: number) => void

    // Section
    markSectionComplete: (params: {
        courseSlug: string
        chapterSlug: string
        sectionId: string
        timeSpentSeconds: number
    }) => void

    isSectionComplete: (sectionId: string) => boolean

    getCourseProgress: (courseSlug: string) => CourseProgress | null

    setContinuePosition: (params: {
        courseSlug: string
        chapterSlug: string
        sectionId: string
    }) => void

    // Quiz
    recordQuizAttempt: (attempt: QuizAttempt) => void
    getQuizAttempts: (courseSlug: string) => QuizAttempt[]
    getBestQuizScore: (courseSlug: string) => number

    // Activity
    recordActivity: () => void

    // Computed
    getContinueLearning: (
        courses: Array<{ slug: string; title: string; icon: string; totalSections: number }>
    ) => ContinueLearning[]

    getCompletionPercentage: (courseSlug: string) => number

    // Reset
    resetProgress: () => void
}

type ProgressState = ProgressStore & ProgressActions

export const useProgressStore = create<ProgressState>()(
    persist(
        immer((set, get) => ({
            // Initial state
            courses: {},
            sections: {},
            quizAttempts: [],
            stats: { ...initialStats },
            version: STORE_VERSION,

            startCourse(courseSlug: string, totalSections: number) {
                set(state => {
                    if (!state.courses[courseSlug]) {
                        state.courses[courseSlug] = {
                            courseSlug,
                            startedAt: new Date().toISOString(),
                            lastAccessedAt: new Date().toISOString(),
                            completedSectionIds: [],
                            totalSections,
                            completionPercentage: 0,
                            totalTimeSpentSeconds: 0,
                        }
                        state.stats.totalCoursesStarted++
                    } else {
                        state.courses[courseSlug].lastAccessedAt = new Date().toISOString()
                        state.courses[courseSlug].totalSections = totalSections
                    }
                })
                get().recordActivity()
            },

            markSectionComplete({ courseSlug, chapterSlug, sectionId, timeSpentSeconds }) {
                set(state => {
                    const now = new Date().toISOString()

                    // Update section progress
                    if (!state.sections[sectionId]) {
                        state.sections[sectionId] = {
                            sectionId,
                            courseSlug,
                            chapterSlug,
                            completedAt: now,
                            timeSpentSeconds,
                        }
                        state.stats.totalSectionsCompleted++
                    }

                    // Update course progress
                    if (!state.courses[courseSlug]) {
                        state.courses[courseSlug] = {
                            courseSlug,
                            startedAt: now,
                            lastAccessedAt: now,
                            completedSectionIds: [],
                            totalSections: 0,
                            completionPercentage: 0,
                            totalTimeSpentSeconds: 0,
                        }
                        state.stats.totalCoursesStarted++
                    }

                    const course = state.courses[courseSlug]
                    if (!course.completedSectionIds.includes(sectionId)) {
                        course.completedSectionIds.push(sectionId)
                        course.totalTimeSpentSeconds += timeSpentSeconds
                        state.stats.totalTimeSpentSeconds += timeSpentSeconds
                    }

                    course.lastAccessedAt = now
                    course.completionPercentage = course.totalSections > 0
                        ? Math.round((course.completedSectionIds.length / course.totalSections) * 100)
                        : 0

                    // Check completion
                    if (course.completionPercentage === 100 && !course.completedAt) {
                        course.completedAt = now
                        state.stats.totalCoursesCompleted++
                    }
                })
                get().recordActivity()
            },

            isSectionComplete(sectionId: string) {
                return !!get().sections[sectionId]
            },

            getCourseProgress(courseSlug: string) {
                return get().courses[courseSlug] ?? null
            },

            setContinuePosition({ courseSlug, chapterSlug, sectionId }) {
                set(state => {
                    if (state.courses[courseSlug]) {
                        state.courses[courseSlug].lastChapterSlug = chapterSlug
                        state.courses[courseSlug].lastSectionId = sectionId
                        state.courses[courseSlug].lastAccessedAt = new Date().toISOString()
                    }
                })
            },

            recordQuizAttempt(attempt: QuizAttempt) {
                set(state => {
                    state.quizAttempts.push(attempt)
                    state.stats.totalQuizzesTaken++

                    // Recalculate average
                    const allScores = state.quizAttempts.map(a => a.score)
                    state.stats.averageQuizScore = Math.round(
                        allScores.reduce((s, a) => s + a, 0) / allScores.length
                    )
                })
                get().recordActivity()
            },

            getQuizAttempts(courseSlug: string) {
                return get().quizAttempts.filter(a => a.courseSlug === courseSlug)
            },

            getBestQuizScore(courseSlug: string) {
                const attempts = get().getQuizAttempts(courseSlug)
                if (!attempts.length) return 0
                return Math.max(...attempts.map(a => a.score))
            },

            recordActivity() {
                set(state => {
                    const today = format(new Date(), 'yyyy-MM-dd')
                    const streak = state.stats.streak

                    if (!streak.activeDays.includes(today)) {
                        streak.activeDays.push(today)

                        // Calculate current streak
                        const sortedDays = [...streak.activeDays].sort()
                        let current = 1

                        for (let i = sortedDays.length - 1; i > 0; i--) {
                            const diff = differenceInCalendarDays(
                                parseISO(sortedDays[i]),
                                parseISO(sortedDays[i - 1])
                            )
                            if (diff === 1) {
                                current++
                            } else {
                                break
                            }
                        }

                        streak.currentStreak = current
                        streak.longestStreak = Math.max(streak.longestStreak, current)
                        streak.lastActivityDate = today
                    }
                })
            },

            getContinueLearning(courses) {
                const state = get()
                return courses
                    .filter(c => state.courses[c.slug])
                    .sort((a, b) => {
                        const aTime = state.courses[a.slug]?.lastAccessedAt ?? ''
                        const bTime = state.courses[b.slug]?.lastAccessedAt ?? ''
                        return bTime.localeCompare(aTime)
                    })
                    .slice(0, 4)
                    .map(c => {
                        const progress = state.courses[c.slug]
                        return {
                            courseSlug: c.slug,
                            courseTitle: c.title,
                            courseIcon: c.icon,
                            chapterSlug: progress.lastChapterSlug ?? '',
                            sectionId: progress.lastSectionId ?? '',
                            sectionTitle: 'Continue where you left off',
                            completionPercentage: progress.completionPercentage,
                            lastAccessedAt: progress.lastAccessedAt,
                        }
                    })
            },

            getCompletionPercentage(courseSlug: string) {
                return get().courses[courseSlug]?.completionPercentage ?? 0
            },

            resetProgress() {
                set(state => {
                    state.courses = {}
                    state.sections = {}
                    state.quizAttempts = []
                    state.stats = { ...initialStats, joinedAt: state.stats.joinedAt }
                })
            },
        })),
        {
            name: 'devlearn-progress',
            storage: createJSONStorage(() => localStorage),
            version: STORE_VERSION,
        }
    )
)