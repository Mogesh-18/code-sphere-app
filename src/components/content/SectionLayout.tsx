'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, ArrowRight, ChevronDown, ChevronRight, CheckCircle2,
    BookOpen, Clock, Brain, Menu, X,
} from 'lucide-react'
import type { Course, Chapter, Section } from '@/types/content'
import type { SectionNav } from '@/lib/content/loader'
import { ContentRenderer } from './ContentRenderer'
import { AIChatAssistant } from '@/components/ai/ChatAssistant'
import { Navbar } from '@/components/layout/Navbar'
import { useProgressStore } from '@/lib/progress/store'
import { cn, formatReadingTime, contentNodesToText } from '@/lib/utils'

interface Props {
    course: Course
    chapter: Chapter
    section: Section
    nav: SectionNav
}

export function SectionLayout({ course, chapter, section, nav }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [aiOpen, setAiOpen] = useState(false)
    const startTimeRef = useRef(Date.now())
    const router = useRouter()

    const { markSectionComplete, setContinuePosition, isSectionComplete } = useProgressStore()
    const isComplete = isSectionComplete(section.id)

    // Track continue position
    useEffect(() => {
        setContinuePosition({
            courseSlug: course.slug,
            chapterSlug: chapter.slug,
            sectionId: section.id,
        })
        startTimeRef.current = Date.now()
    }, [section.id])

    function handleMarkComplete() {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)
        markSectionComplete({
            courseSlug: course.slug,
            chapterSlug: chapter.slug,
            sectionId: section.id,
            timeSpentSeconds: Math.max(timeSpent, 10),
        })

        // Auto-navigate to next section after marking complete
        if (nav.next) {
            setTimeout(() => {
                router.push(
                    `/courses/${nav.next!.courseSlug}/${nav.next!.chapterSlug}/${nav.next!.sectionSlug}`
                )
            }, 400)
        }
    }

    const aiContext = {
        courseSlug: course.slug,
        courseTitle: course.title,
        chapterTitle: chapter.title,
        sectionTitle: section.title,
        currentContent: contentNodesToText(section.content),
    }

    return (
        <div className="min-h-screen bg-[#07070D] flex flex-col">
            <Navbar />

            <div className="flex flex-1 pt-[var(--nav-height)]">

                {/* ── Sidebar ── */}
                <CourseSidebar
                    course={course}
                    currentChapterSlug={chapter.slug}
                    currentSectionId={section.id}
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* ── Main content ── */}
                <main className="flex-1 min-w-0 lg:ml-72">
                    {/* Top breadcrumb bar */}
                    <div className="sticky top-[var(--nav-height)] z-30 flex items-center gap-3 px-6 py-3 bg-[#0A0A12]/90 backdrop-blur border-b border-white/[0.06]">
                        {/* Mobile sidebar toggle */}
                        <button
                            className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={18} />
                        </button>

                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] min-w-0 flex-1">
                            <Link href={`/courses/${course.slug}`} className="hover:text-white transition-colors truncate">
                                {course.title}
                            </Link>
                            <ChevronRight size={11} />
                            <span className="text-[var(--text-secondary)] truncate">{chapter.title}</span>
                            <ChevronRight size={11} />
                            <span className="text-white truncate">{section.title}</span>
                        </div>

                        {/* AI button */}
                        <button
                            onClick={() => setAiOpen(v => !v)}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-600 border transition-all',
                                aiOpen
                                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                    : 'bg-white/[0.04] text-[var(--text-secondary)] border-white/[0.08] hover:border-cyan-500/30 hover:text-cyan-400'
                            )}
                        >
                            <Brain size={13} />
                            Ask AI
                        </button>
                    </div>

                    {/* Content + AI side-by-side */}
                    <div className={cn('flex', aiOpen && 'divide-x divide-white/[0.06]')}>

                        {/* Article */}
                        <article
                            className={cn(
                                'flex-1 min-w-0 px-6 md:px-10 lg:px-16 py-10',
                                aiOpen && 'xl:max-w-[calc(100%-400px)]'
                            )}
                        >
                            {/* Section header */}
                            <header className="mb-8">
                                <p className="text-xs font-600 text-amber-400 uppercase tracking-widest mb-3">
                                    {chapter.title}
                                </p>
                                <h1 className="font-display text-3xl sm:text-4xl font-700 text-white mb-4">
                                    {section.title}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={13} />
                                        {formatReadingTime(section.readingTimeMinutes)}
                                    </span>
                                    {section.codeLanguages.length > 0 && (
                                        <span className="flex items-center gap-1.5">
                                            <BookOpen size={13} />
                                            {section.codeLanguages.join(', ')}
                                        </span>
                                    )}
                                    {isComplete && (
                                        <span className="flex items-center gap-1.5 text-emerald-400">
                                            <CheckCircle2 size={13} />
                                            Completed
                                        </span>
                                    )}
                                </div>
                            </header>

                            {/* Content */}
                            <ContentRenderer nodes={section.content} />

                            {/* Navigation footer */}
                            <footer className="mt-16 pt-8 border-t border-white/[0.06]">
                                {/* Mark complete */}
                                {!isComplete && (
                                    <div className="flex justify-center mb-8">
                                        <button
                                            onClick={handleMarkComplete}
                                            className="btn btn-primary btn-lg group"
                                        >
                                            <CheckCircle2 size={17} />
                                            Mark Complete & Continue
                                            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )}

                                {/* Prev / Next */}
                                <div className="flex items-center justify-between gap-4">
                                    {nav.prev ? (
                                        <Link
                                            href={`/courses/${nav.prev.courseSlug}/${nav.prev.chapterSlug}/${nav.prev.sectionSlug}`}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0F0F1A] hover:border-white/[0.16] transition-all group max-w-[45%]"
                                        >
                                            <ArrowLeft size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-[var(--text-muted)] mb-0.5">Previous</p>
                                                <p className="text-sm text-white font-500 truncate">{nav.prev.title}</p>
                                            </div>
                                        </Link>
                                    ) : <div />}

                                    {nav.next && (
                                        <Link
                                            href={`/courses/${nav.next.courseSlug}/${nav.next.chapterSlug}/${nav.next.sectionSlug}`}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/[0.08] bg-[#0F0F1A] hover:border-amber-500/30 transition-all group max-w-[45%] ml-auto text-right"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs text-[var(--text-muted)] mb-0.5">Next</p>
                                                <p className="text-sm text-white font-500 truncate">{nav.next.title}</p>
                                            </div>
                                            <ArrowRight size={14} className="text-amber-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>
                            </footer>
                        </article>

                        {/* AI panel */}
                        {aiOpen && (
                            <div className="hidden xl:flex w-[400px] flex-shrink-0">
                                <AIChatAssistant
                                    context={aiContext}
                                    onClose={() => setAiOpen(false)}
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile AI chat (bottom sheet) */}
            {aiOpen && (
                <div className="xl:hidden fixed inset-0 z-50 flex flex-col">
                    <div
                        className="flex-1 bg-black/60 backdrop-blur-sm"
                        onClick={() => setAiOpen(false)}
                    />
                    <div className="h-[70vh] bg-[#0F0F1A] border-t border-white/[0.1] flex flex-col">
                        <AIChatAssistant context={aiContext} onClose={() => setAiOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}

// ──────────────────────────────────────────────────
// Course Sidebar
// ──────────────────────────────────────────────────

interface SidebarProps {
    course: Course
    currentChapterSlug: string
    currentSectionId: string
    open: boolean
    onClose: () => void
}

function CourseSidebar({ course, currentChapterSlug, currentSectionId, open, onClose }: SidebarProps) {
    const completedSections = useProgressStore(
        s => s.courses[course.slug]?.completedSectionIds ?? []
    )

    return (
        <>
            {/* Overlay (mobile) */}
            {open && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <nav
                className={cn(
                    'fixed top-[var(--nav-height)] left-0 bottom-0 z-40 w-72',
                    'bg-[#0A0A12] border-r border-white/[0.06] overflow-y-auto',
                    'transition-transform duration-300',
                    'lg:translate-x-0',
                    open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Sidebar header */}
                <div className="sticky top-0 flex items-center gap-3 px-5 py-4 bg-[#0A0A12] border-b border-white/[0.06] z-10">
                    <Link
                        href={`/courses/${course.slug}`}
                        className="flex items-center gap-2 text-sm font-600 text-white hover:text-amber-400 transition-colors min-w-0 flex-1"
                    >
                        <span className="text-lg flex-shrink-0">{course.icon}</span>
                        <span className="truncate">{course.title}</span>
                    </Link>
                    <button
                        className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white flex-shrink-0"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Progress */}
                <div className="px-5 py-4 border-b border-white/[0.06]">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[var(--text-muted)]">Progress</span>
                        <span className="text-amber-400 font-600">
                            {Math.round((completedSections.length / course.totalSections) * 100)}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(completedSections.length / course.totalSections) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Chapters */}
                <div className="py-3">
                    {course.chapters.map(ch => (
                        <ChapterAccordion
                            key={ch.id}
                            chapter={ch}
                            courseSlug={course.slug}
                            isCurrentChapter={ch.slug === currentChapterSlug}
                            currentSectionId={currentSectionId}
                            completedSections={completedSections}
                        />
                    ))}
                </div>
            </nav>
        </>
    )
}

function ChapterAccordion({
    chapter, courseSlug, isCurrentChapter, currentSectionId, completedSections,
}: {
    chapter: Chapter
    courseSlug: string
    isCurrentChapter: boolean
    currentSectionId: string
    completedSections: string[]
}) {
    const [expanded, setExpanded] = useState(isCurrentChapter)
    const completedCount = chapter.sections.filter(s => completedSections.includes(s.id)).length

    return (
        <div>
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-2.5 px-5 py-3 hover:bg-white/[0.03] transition-colors group"
            >
                <div className="flex-1 min-w-0 text-left">
                    <p className={cn(
                        'text-xs font-600 truncate',
                        isCurrentChapter ? 'text-amber-400' : 'text-[var(--text-secondary)]'
                    )}>
                        {chapter.title}
                    </p>
                    <p className="text-2xs text-[var(--text-muted)] mt-0.5">
                        {completedCount}/{chapter.sections.length} sections
                    </p>
                </div>
                <ChevronDown
                    size={14}
                    className={cn(
                        'text-[var(--text-muted)] flex-shrink-0 transition-transform',
                        expanded && 'rotate-180'
                    )}
                />
            </button>

            {expanded && (
                <div className="pb-2">
                    {chapter.sections.map(section => {
                        const isCurrent = section.id === currentSectionId
                        const done = completedSections.includes(section.id)

                        return (
                            <Link
                                key={section.id}
                                href={`/courses/${courseSlug}/${chapter.slug}/${section.slug}`}
                                className={cn(
                                    'flex items-center gap-2.5 pl-9 pr-5 py-2.5 text-xs transition-all',
                                    isCurrent
                                        ? 'bg-amber-500/10 text-amber-400 border-r-2 border-amber-500'
                                        : 'text-[var(--text-muted)] hover:text-white hover:bg-white/[0.03]'
                                )}
                            >
                                <div className={cn(
                                    'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0',
                                    done
                                        ? 'bg-emerald-500/20 border-emerald-500/40'
                                        : isCurrent
                                            ? 'bg-amber-500/20 border-amber-500/40'
                                            : 'bg-white/[0.04] border-white/[0.12]'
                                )}>
                                    {done && <CheckCircle2 size={10} className="text-emerald-400" />}
                                    {!done && isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                                </div>
                                <span className="flex-1 truncate">{section.title}</span>
                                <span className="text-2xs text-[var(--text-muted)] flex-shrink-0">
                                    {section.readingTimeMinutes}m
                                </span>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}