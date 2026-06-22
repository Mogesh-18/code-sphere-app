#!/usr/bin/env tsx
/**
 * Content Processing Pipeline
 *
 * Runs at build time to convert markdown guides into structured JSON.
 * The frontend never parses markdown — it only consumes the output JSON.
 *
 * Output structure:
 *   public/content/registry.json        — course index
 *   public/content/{slug}/course.json   — full course with all chapters & sections
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import slugify from 'slugify'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import { toString as mdastToString } from 'mdast-util-to-string'
import type { Root, Heading, Paragraph, Code, List, Table, Blockquote, ThematicBreak, Html, ListItem } from 'mdast'
import type {
    Course,
    CourseMetadata,
    Chapter,
    Section,
    ContentNode,
    ContentRegistry,
    HeadingNode,
    ParagraphNode,
    CodeBlockNode,
    ListNode,
    TableNode,
    BlockquoteNode,
    DividerNode,
    TocEntry,
    InlineNode,
} from '../src/types/content'

// ──────────────────────────────────────────────────
// Course metadata definitions
// Add new courses here when new guides are added.
// The actual content is parsed automatically.
// ──────────────────────────────────────────────────

interface GuideConfig {
    slug: string
    filename: string
    title: string
    tagline: string
    category: Course['category']
    difficulty: Course['difficulty']
    tags: string[]
    icon: string
    color: string
    gradient: string
    prerequisites: string[]
    relatedCourses: string[]
    author: string
    version: string
}

const GUIDE_CONFIGS: GuideConfig[] = [
    {
        slug: 'html',
        filename: 'html-guide.md',
        title: 'HTML5 Professional',
        tagline: 'Master semantic markup, accessibility, and modern HTML5',
        category: 'frontend',
        difficulty: 'beginner',
        tags: ['html', 'semantic', 'accessibility', 'seo', 'forms'],
        icon: '🌐',
        color: '#E34F26',
        gradient: 'from-orange-600 to-red-500',
        prerequisites: [],
        relatedCourses: ['css', 'javascript'],
        author: 'Internal',
        version: '1.0.0',
    },
    {
        slug: 'css',
        filename: 'css-guide.md',
        title: 'CSS Professional',
        tagline: 'Flexbox, Grid, animations, and modern CSS architecture',
        category: 'frontend',
        difficulty: 'beginner',
        tags: ['css', 'flexbox', 'grid', 'responsive', 'animations'],
        icon: '🎨',
        color: '#264DE4',
        gradient: 'from-blue-600 to-indigo-500',
        prerequisites: ['html'],
        relatedCourses: ['html', 'javascript'],
        author: 'Internal',
        version: '1.0.0',
    },
    {
        slug: 'javascript',
        filename: 'javascript-guide.md',
        title: 'JavaScript Professional',
        tagline: 'Modern ES2024 JavaScript from fundamentals to mastery',
        category: 'language',
        difficulty: 'intermediate',
        tags: ['javascript', 'es6', 'async', 'dom', 'modules'],
        icon: '⚡',
        color: '#F7DF1E',
        gradient: 'from-yellow-500 to-amber-400',
        prerequisites: ['html', 'css'],
        relatedCourses: ['jquery', 'html', 'css'],
        author: 'Internal',
        version: '1.0.0',
    },
    {
        slug: 'jquery',
        filename: 'jquery-guide.md',
        title: 'jQuery Professional',
        tagline: 'Master jQuery for legacy codebases and WordPress development',
        category: 'frontend',
        difficulty: 'intermediate',
        tags: ['jquery', 'dom', 'ajax', 'legacy', 'plugins'],
        icon: '🔮',
        color: '#0769AD',
        gradient: 'from-blue-700 to-cyan-600',
        prerequisites: ['javascript'],
        relatedCourses: ['javascript', 'html', 'css'],
        author: 'Internal',
        version: '1.0.0',
    },
    {
        slug: 'php',
        filename: 'php-guide.md',
        title: 'PHP Professional',
        tagline: 'Modern PHP 8.3 — OOP, security, and best practices',
        category: 'backend',
        difficulty: 'intermediate',
        tags: ['php', 'oop', 'security', 'pdo', 'composer'],
        icon: '🐘',
        color: '#8892BE',
        gradient: 'from-purple-600 to-violet-500',
        prerequisites: ['html'],
        relatedCourses: ['laravel', 'html'],
        author: 'Internal',
        version: '1.0.0',
    },
    {
        slug: 'laravel',
        filename: 'laravel-guide.md',
        title: 'Laravel Professional',
        tagline: 'Build production-grade applications with Laravel 11',
        category: 'framework',
        difficulty: 'advanced',
        tags: ['laravel', 'php', 'eloquent', 'api', 'queues'],
        icon: '🚀',
        color: '#FF2D20',
        gradient: 'from-red-600 to-orange-500',
        prerequisites: ['php'],
        relatedCourses: ['php', 'javascript'],
        author: 'Internal',
        version: '1.0.0',
    },
]

// ──────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────

function makeSlug(text: string): string {
    return slugify(text, { lower: true, strict: true, trim: true })
}

function makeId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

function estimateReadingTime(text: string): number {
    const wordsPerMinute = 200
    const words = text.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / wordsPerMinute))
}

// ──────────────────────────────────────────────────
// Inline node parser
// ──────────────────────────────────────────────────

function parseInlineNodes(node: any): InlineNode[] {
    if (!node.children) {
        if (node.type === 'text') return [{ type: 'text', value: node.value || '' }]
        if (node.type === 'inlineCode') return [{ type: 'code', value: node.value || '' }]
        if (node.type === 'break') return [{ type: 'linebreak' }]
        return [{ type: 'text', value: mdastToString(node) }]
    }

    const results: InlineNode[] = []
    for (const child of node.children) {
        switch (child.type) {
            case 'text':
                results.push({ type: 'text', value: child.value })
                break
            case 'strong':
                results.push({ type: 'strong', children: parseInlineNodes(child) })
                break
            case 'emphasis':
                results.push({ type: 'emphasis', children: parseInlineNodes(child) })
                break
            case 'inlineCode':
                results.push({ type: 'code', value: child.value })
                break
            case 'link':
                results.push({
                    type: 'link',
                    href: child.url || '#',
                    children: parseInlineNodes(child),
                })
                break
            case 'break':
                results.push({ type: 'linebreak' })
                break
            default:
                // Fallback: extract text
                const text = mdastToString(child)
                if (text) results.push({ type: 'text', value: text })
        }
    }
    return results
}

// ──────────────────────────────────────────────────
// AST node → ContentNode converter
// ──────────────────────────────────────────────────

function convertNode(node: any, headingIds: Set<string>): ContentNode | null {
    switch (node.type) {
        case 'heading': {
            const text = mdastToString(node)
            let id = makeId(text)
            // Ensure unique IDs
            let counter = 1
            const baseId = id
            while (headingIds.has(id)) {
                id = `${baseId}-${counter++}`
            }
            headingIds.add(id)
            return {
                type: 'heading',
                level: node.depth as 1 | 2 | 3 | 4 | 5 | 6,
                text,
                id,
            } satisfies HeadingNode
        }

        case 'paragraph': {
            const children = parseInlineNodes(node)
            if (!children.length) return null
            return {
                type: 'paragraph',
                children,
            } satisfies ParagraphNode
        }

        case 'code': {
            const lang = node.lang?.split(':')[0] || 'text'
            const filename = node.lang?.includes(':') ? node.lang.split(':')[1] : undefined
            return {
                type: 'code',
                language: lang,
                code: node.value,
                filename,
            } satisfies CodeBlockNode
        }

        case 'list': {
            const items = (node.children as any[]).map((item: ListItem) => ({
                children: convertNodes((item as any).children || [], headingIds),
            }))
            return {
                type: 'list',
                ordered: node.ordered || false,
                items,
            } satisfies ListNode
        }

        case 'table': {
            const [headerRow, ...bodyRows] = node.children as any[]
            const headers = (headerRow.children as any[]).map((cell: any) =>
                mdastToString(cell)
            )
            const rows = bodyRows.map((row: any) =>
                (row.children as any[]).map((cell: any) => mdastToString(cell))
            )
            const align = node.align || headers.map(() => null)
            return {
                type: 'table',
                headers,
                rows,
                align,
            } satisfies TableNode
        }

        case 'blockquote': {
            return {
                type: 'blockquote',
                children: convertNodes(node.children || [], headingIds),
            } satisfies BlockquoteNode
        }

        case 'thematicBreak': {
            return { type: 'divider' } satisfies DividerNode
        }

        case 'html': {
            // Skip HTML nodes in content (security + not needed)
            return null
        }

        default:
            return null
    }
}

function convertNodes(nodes: any[], headingIds: Set<string>): ContentNode[] {
    return nodes
        .map(n => convertNode(n, headingIds))
        .filter((n): n is ContentNode => n !== null)
}

// ──────────────────────────────────────────────────
// Build Table of Contents
// ──────────────────────────────────────────────────

function buildToc(nodes: ContentNode[]): TocEntry[] {
    const headings = nodes.filter((n): n is HeadingNode => n.type === 'heading')
    const toc: TocEntry[] = []
    const stack: Array<{ level: number; entry: TocEntry }> = []

    for (const h of headings) {
        if (h.level < 2) continue // Skip H1 — it's the section title
        const entry: TocEntry = { id: h.id, text: h.text, level: h.level, children: [] }

        while (stack.length > 0 && stack[stack.length - 1].level >= h.level) {
            stack.pop()
        }

        if (stack.length === 0) {
            toc.push(entry)
        } else {
            stack[stack.length - 1].entry.children.push(entry)
        }

        stack.push({ level: h.level, entry })
    }

    return toc
}

// ──────────────────────────────────────────────────
// Parse a full markdown document into chapters
// ──────────────────────────────────────────────────

interface ParsedGuide {
    chapters: Chapter[]
    totalReadingMinutes: number
    totalSections: number
}

function parseMarkdownGuide(markdown: string): ParsedGuide {
    const processor = unified().use(remarkParse).use(remarkGfm)
    const tree = processor.parse(markdown) as Root

    const nodes = tree.children
    const chapters: Chapter[] = []
    let currentChapterIndex = -1
    let currentSectionNodes: any[] = []
    let currentSectionTitle = ''
    let currentSectionOrder = 0
    let h2Count = 0

    function flushSection() {
        if (!currentSectionTitle || currentChapterIndex < 0) return
        if (!currentSectionNodes.length) return

        const headingIds = new Set<string>()
        const contentNodes = convertNodes(currentSectionNodes, headingIds)
        const rawText = currentSectionNodes.map(n => mdastToString(n)).join(' ')
        const readingMinutes = estimateReadingTime(rawText)
        const codeBlocks = contentNodes.filter((n): n is CodeBlockNode => n.type === 'code')
        const toc = buildToc(contentNodes)

        const section: Section = {
            id: `${chapters[currentChapterIndex].slug}-s${currentSectionOrder}`,
            slug: makeSlug(currentSectionTitle) || `section-${currentSectionOrder}`,
            title: currentSectionTitle,
            order: currentSectionOrder,
            content: contentNodes,
            toc,
            readingTimeMinutes: readingMinutes,
            hasCodeExamples: codeBlocks.length > 0,
            codeLanguages: [...new Set(codeBlocks.map(b => b.language))],
        }

        chapters[currentChapterIndex].sections.push(section)
        chapters[currentChapterIndex].totalReadingMinutes += readingMinutes
    }

    for (const node of nodes) {
        if (node.type === 'heading') {
            const headingNode = node as Heading

            if (headingNode.depth === 2) {
                // New chapter
                flushSection()
                h2Count++
                const chapterTitle = mdastToString(headingNode)
                const chapter: Chapter = {
                    id: `chapter-${h2Count}`,
                    slug: `chapter-${h2Count}-${makeSlug(chapterTitle)}`,
                    title: chapterTitle,
                    order: h2Count,
                    sections: [],
                    totalReadingMinutes: 0,
                }
                chapters.push(chapter)
                currentChapterIndex = chapters.length - 1
                currentSectionTitle = chapterTitle
                currentSectionOrder = 1
                currentSectionNodes = []
                // Don't add the H2 itself to section nodes — it's the section title

            } else if (headingNode.depth === 3) {
                // New section within chapter
                if (currentChapterIndex >= 0) {
                    flushSection()
                    currentSectionTitle = mdastToString(headingNode)
                    currentSectionOrder++
                    currentSectionNodes = []
                    // Add H3 as H2 to section content for hierarchy
                    currentSectionNodes.push({
                        ...headingNode,
                        depth: 2,
                    })
                }

            } else {
                // H4, H5, H6 — add to current section
                if (currentChapterIndex >= 0) {
                    currentSectionNodes.push(node)
                }
            }

        } else {
            // Content node — add to current section
            if (currentChapterIndex >= 0) {
                currentSectionNodes.push(node)
            }
        }
    }

    // Flush last section
    flushSection()

    const totalSections = chapters.reduce((sum, ch) => sum + ch.sections.length, 0)
    const totalReadingMinutes = chapters.reduce((sum, ch) => sum + ch.totalReadingMinutes, 0)

    return { chapters, totalReadingMinutes, totalSections }
}

// ──────────────────────────────────────────────────
// Main pipeline runner
// ──────────────────────────────────────────────────

async function processCourse(config: GuideConfig, guidesDir: string, outputDir: string): Promise<CourseMetadata> {
    const filePath = path.join(guidesDir, config.filename)

    if (!fs.existsSync(filePath)) {
        console.warn(`  ⚠️  Guide file not found: ${config.filename} — creating placeholder`)
        // Create a minimal placeholder
        const placeholder = `# ${config.title}\n\n## Introduction\n\n### Getting Started\n\nContent coming soon.\n`
        fs.writeFileSync(filePath, placeholder)
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(raw)

    console.log(`  📖 Parsing ${config.filename}...`)
    const { chapters, totalReadingMinutes, totalSections } = parseMarkdownGuide(content)
    console.log(`     → ${chapters.length} chapters, ${totalSections} sections, ~${totalReadingMinutes}min read`)

    const course: Course = {
        ...config,
        id: config.slug,
        chapters,
        totalSections,
        totalReadingMinutes,
        updatedAt: new Date().toISOString(),
    }

    // Write course JSON
    const courseDir = path.join(outputDir, config.slug)
    fs.mkdirSync(courseDir, { recursive: true })
    fs.writeFileSync(
        path.join(courseDir, 'course.json'),
        JSON.stringify(course, null, 2)
    )

    // Also write chapter-level files for faster loading
    for (const chapter of chapters) {
        fs.writeFileSync(
            path.join(courseDir, `${chapter.slug}.json`),
            JSON.stringify(chapter, null, 2)
        )
    }

    const metadata: CourseMetadata = {
        ...config,
        id: config.slug,
        totalSections,
        totalReadingMinutes,
        chapterCount: chapters.length,
        sectionCount: totalSections,
        updatedAt: course.updatedAt,
    }

    return metadata
}

async function main() {
    const rootDir = path.resolve(__dirname, '..')
    const guidesDir = path.join(rootDir, 'content', 'guides')
    const outputDir = path.join(rootDir, 'public', 'content')

    console.log('\n🔨 DevLearn Content Pipeline')
    console.log('═'.repeat(40))
    console.log(`📂 Guides:  ${guidesDir}`)
    console.log(`📂 Output:  ${outputDir}`)
    console.log()

    // Ensure directories exist
    fs.mkdirSync(guidesDir, { recursive: true })
    fs.mkdirSync(outputDir, { recursive: true })

    const courses: CourseMetadata[] = []

    for (const config of GUIDE_CONFIGS) {
        try {
            const metadata = await processCourse(config, guidesDir, outputDir)
            courses.push(metadata)
            console.log(`  ✅ ${config.slug}`)
        } catch (error) {
            console.error(`  ❌ ${config.slug}:`, error)
        }
    }

    // Write registry
    const registry: ContentRegistry = {
        courses,
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
    }

    fs.writeFileSync(
        path.join(outputDir, 'registry.json'),
        JSON.stringify(registry, null, 2)
    )

    console.log()
    console.log(`✨ Pipeline complete: ${courses.length} courses processed`)
    console.log(`📄 Registry: ${path.join(outputDir, 'registry.json')}`)
    console.log()
}

main().catch(console.error)
