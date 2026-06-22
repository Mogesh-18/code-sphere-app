'use client'

import { useEffect, useRef } from 'react'
import { useProgressStore } from '@/lib/progress/store'
import type { CourseMetadata } from '@/types/content'

/**
 * Hook for components that need to interact with course progress.
 * Handles starting courses, marking sections, and reading state.
 */
export function useProgress(courseSlug: string, totalSections: number) {
    const store = useProgressStore()
    const initializedRef = useRef(false)

    // Ensure the course is started when first accessed
    useEffect(() => {
        if (!initializedRef.current && courseSlug) {
            store.startCourse(courseSlug, totalSections)
            initializedRef.current = true
        }
    }, [courseSlug, totalSections])

    const progress = store.getCourseProgress(courseSlug)

    return {
        progress,
        completionPercentage: progress?.completionPercentage ?? 0,
        completedSectionIds: progress?.completedSectionIds ?? [],
        isSectionComplete: (sectionId: string) => store.isSectionComplete(sectionId),
        markSectionComplete: store.markSectionComplete,
        setContinuePosition: store.setContinuePosition,
    }
}

/**
 * Hook for the dashboard — aggregates progress across all courses
 */
export function useLearningStats(courses: CourseMetadata[]) {
    const store = useProgressStore()

    const continueLearning = store.getContinueLearning(
        courses.map(c => ({
            slug: c.slug,
            title: c.title,
            icon: c.icon,
            totalSections: c.totalSections,
        }))
    )

    return {
        stats: store.stats,
        coursesProgress: store.courses,
        quizAttempts: store.quizAttempts,
        continueLearning,
    }
}
