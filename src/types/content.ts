// ──────────────────────────────────────────────────
// Content node types — the parsed representation of
// markdown content. The frontend renders these; it
// never parses raw markdown at runtime.
// ──────────────────────────────────────────────────

export type InlineNode =
    | { type: 'text'; value: string }
    | { type: 'strong'; children: InlineNode[] }
    | { type: 'emphasis'; children: InlineNode[] }
    | { type: 'code'; value: string }
    | { type: 'link'; href: string; children: InlineNode[] }
    | { type: 'linebreak' }

export type ContentNode =
    | HeadingNode
    | ParagraphNode
    | CodeBlockNode
    | ListNode
    | TableNode
    | BlockquoteNode
    | CalloutNode
    | DividerNode
    | HtmlNode

export interface HeadingNode {
    type: 'heading'
    level: 1 | 2 | 3 | 4 | 5 | 6
    text: string
    id: string
}

export interface ParagraphNode {
    type: 'paragraph'
    children: InlineNode[]
}

export interface CodeBlockNode {
    type: 'code'
    language: string
    code: string
    filename?: string
    highlight?: number[]
}

export interface ListNode {
    type: 'list'
    ordered: boolean
    items: ListItemNode[]
}

export interface ListItemNode {
    children: ContentNode[]
}

export interface TableNode {
    type: 'table'
    headers: string[]
    rows: string[][]
    align?: Array<'left' | 'center' | 'right' | null>
}

export interface BlockquoteNode {
    type: 'blockquote'
    children: ContentNode[]
}

export interface CalloutNode {
    type: 'callout'
    variant: 'note' | 'tip' | 'warning' | 'danger' | 'info'
    title?: string
    children: ContentNode[]
}

export interface DividerNode {
    type: 'divider'
}

export interface HtmlNode {
    type: 'html'
    value: string
}

// ──────────────────────────────────────────────────
// Table of Contents
// ──────────────────────────────────────────────────

export interface TocEntry {
    id: string
    text: string
    level: number
    children: TocEntry[]
}

// ──────────────────────────────────────────────────
// Section — smallest learnable unit
// ──────────────────────────────────────────────────

export interface Section {
    id: string
    slug: string
    title: string
    order: number
    content: ContentNode[]
    toc: TocEntry[]
    readingTimeMinutes: number
    hasCodeExamples: boolean
    codeLanguages: string[]
}

// ──────────────────────────────────────────────────
// Chapter — groups related sections
// ──────────────────────────────────────────────────

export interface Chapter {
    id: string
    slug: string
    title: string
    order: number
    description?: string
    sections: Section[]
    totalReadingMinutes: number
}

// ──────────────────────────────────────────────────
// Course — top-level learning unit
// ──────────────────────────────────────────────────

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export type CourseCategory =
    | 'frontend'
    | 'backend'
    | 'fullstack'
    | 'framework'
    | 'language'
    | 'tools'

export interface Course {
    id: string
    slug: string
    title: string
    tagline: string
    description?: string
    category: CourseCategory
    difficulty: DifficultyLevel
    tags: string[]
    icon: string           // emoji or icon name
    color: string          // hex accent color
    gradient: string       // tailwind gradient classes
    chapters: Chapter[]
    totalSections: number
    totalReadingMinutes: number
    prerequisites: string[] // course slugs
    relatedCourses: string[] // course slugs
    updatedAt: string       // ISO date string
    version: string
    author: string
}

// ──────────────────────────────────────────────────
// Course index — lightweight metadata for listings
// ──────────────────────────────────────────────────

export type CourseMetadata = Omit<Course, 'chapters'> & {
    chapterCount: number
    sectionCount: number
}

// ──────────────────────────────────────────────────
// Content registry — maps slugs to file paths
// Generated at build time
// ──────────────────────────────────────────────────

export interface ContentRegistry {
    courses: CourseMetadata[]
    generatedAt: string
    version: string
}

// ──────────────────────────────────────────────────
// Learning path
// ──────────────────────────────────────────────────

export interface LearningPath {
    id: string
    title: string
    description: string
    icon: string
    gradient: string
    courses: string[]  // ordered course slugs
    estimatedWeeks: number
    targetAudience: string
}