/**
 * Content Loader
 *
 * Reads pre-processed JSON files. Never parses markdown at runtime.
 * In development, falls back to processing on-the-fly if JSON is missing.
 */

import fs from 'fs'
import path from 'path'
import type {
    Course,
    CourseMetadata,
    Chapter,
    Section,
    ContentRegistry,
} from '@/types/content'

const CONTENT_DIR = path.join(process.cwd(), 'public', 'content')

// ──────────────────────────────────────────────────
// Registry
// ──────────────────────────────────────────────────

export function getContentRegistry(): ContentRegistry {
    const registryPath = path.join(CONTENT_DIR, 'registry.json')

    if (!fs.existsSync(registryPath)) {
        // Return empty registry — pipeline hasn't run yet
        return {
            courses: [],
            generatedAt: new Date().toISOString(),
            version: '1.0.0',
        }
    }

    return JSON.parse(fs.readFileSync(registryPath, 'utf-8')) as ContentRegistry
}

export function getAllCourses(): CourseMetadata[] {
    return getContentRegistry().courses
}

export function getCourseMetadata(slug: string): CourseMetadata | null {
    const courses = getAllCourses()
    return courses.find(c => c.slug === slug) ?? null
}

// ──────────────────────────────────────────────────
// Full course data (with all chapters + sections)
// ──────────────────────────────────────────────────

export function getCourse(slug: string): Course | null {
    const coursePath = path.join(CONTENT_DIR, slug, 'course.json')

    if (!fs.existsSync(coursePath)) return null

    return JSON.parse(fs.readFileSync(coursePath, 'utf-8')) as Course
}

// ──────────────────────────────────────────────────
// Chapter
// ──────────────────────────────────────────────────

export function getChapter(courseSlug: string, chapterSlug: string): Chapter | null {
    const chapterPath = path.join(CONTENT_DIR, courseSlug, `${chapterSlug}.json`)

    if (!fs.existsSync(chapterPath)) {
        // Fall back to loading from full course
        const course = getCourse(courseSlug)
        return course?.chapters.find(c => c.slug === chapterSlug) ?? null
    }

    return JSON.parse(fs.readFileSync(chapterPath, 'utf-8')) as Chapter
}

// ──────────────────────────────────────────────────
// Section
// ──────────────────────────────────────────────────

export function getSection(
    courseSlug: string,
    chapterSlug: string,
    sectionSlug: string
): Section | null {
    const chapter = getChapter(courseSlug, chapterSlug)
    return chapter?.sections.find(s => s.slug === sectionSlug) ?? null
}

export function getSectionById(courseSlug: string, sectionId: string): {
    section: Section
    chapter: Chapter
} | null {
    const course = getCourse(courseSlug)
    if (!course) return null

    for (const chapter of course.chapters) {
        const section = chapter.sections.find(s => s.id === sectionId)
        if (section) return { section, chapter }
    }

    return null
}

// ──────────────────────────────────────────────────
// Navigation helpers
// ──────────────────────────────────────────────────

export interface SectionNav {
    prev: { courseSlug: string; chapterSlug: string; sectionSlug: string; title: string } | null
    next: { courseSlug: string; chapterSlug: string; sectionSlug: string; title: string } | null
}

export function getSectionNavigation(
    courseSlug: string,
    chapterSlug: string,
    sectionSlug: string
): SectionNav {
    const course = getCourse(courseSlug)
    if (!course) return { prev: null, next: null }

    // Flatten all sections in order
    const allSections: Array<{
        courseSlug: string
        chapterSlug: string
        sectionSlug: string
        title: string
    }> = []

    for (const chapter of course.chapters) {
        for (const section of chapter.sections) {
            allSections.push({
                courseSlug,
                chapterSlug: chapter.slug,
                sectionSlug: section.slug,
                title: section.title,
            })
        }
    }

    const currentIndex = allSections.findIndex(
        s => s.chapterSlug === chapterSlug && s.sectionSlug === sectionSlug
    )

    if (currentIndex === -1) return { prev: null, next: null }

    return {
        prev: currentIndex > 0 ? allSections[currentIndex - 1] : null,
        next: currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null,
    }
}

// ──────────────────────────────────────────────────
// Static params generators (for Next.js generateStaticParams)
// ──────────────────────────────────────────────────

export function getAllCourseParams() {
    return getAllCourses().map(c => ({ slug: c.slug }))
}

export function getAllChapterParams() {
    const params: Array<{ slug: string; chapter: string }> = []

    for (const courseMetadata of getAllCourses()) {
        const course = getCourse(courseMetadata.slug)
        if (!course) continue
        for (const chapter of course.chapters) {
            params.push({ slug: courseMetadata.slug, chapter: chapter.slug })
        }
    }

    return params
}

export function getAllSectionParams() {
    const params: Array<{ slug: string; chapter: string; section: string }> = []

    for (const courseMetadata of getAllCourses()) {
        const course = getCourse(courseMetadata.slug)
        if (!course) continue
        for (const chapter of course.chapters) {
            for (const section of chapter.sections) {
                params.push({
                    slug: courseMetadata.slug,
                    chapter: chapter.slug,
                    section: section.slug,
                })
            }
        }
    }

    return params
}