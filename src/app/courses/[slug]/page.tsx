import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
    ArrowLeft, Clock, BookOpen, BarChart2, CheckCircle2, Code2,
    ChevronRight, Brain, Trophy, ArrowRight,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CourseProgressWidget } from '@/components/courses/CourseProgressWidget'
import { getCourse, getAllCourseParams } from '@/lib/content/loader'
import { difficultyLabel, difficultyColor, formatReadingTime } from '@/lib/utils'

interface Props {
    params: { slug: string }
}

export async function generateStaticParams() {
    return getAllCourseParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const course = getCourse(params.slug)
    if (!course) return {}
    return {
        title: course.title,
        description: course.description || course.tagline,
    }
}

export default function CourseDetailPage({ params }: Props) {
    const course = getCourse(params.slug)
    if (!course) notFound()

    const firstChapter = course.chapters[0]
    const firstSection = firstChapter?.sections[0]
    const startHref = firstSection
        ? `/courses/${course.slug}/${firstChapter.slug}/${firstSection.slug}`
        : `/courses/${course.slug}`

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-[var(--nav-height)]">

                {/* Hero */}
                <div className="bg-[#0A0A12] border-b border-white/[0.06]">
                    <div className="container-main py-12">
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-white transition-colors mb-8"
                        >
                            <ArrowLeft size={14} /> All Courses
                        </Link>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left */}
                            <div className="lg:col-span-2">
                                {/* Icon + category */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border border-white/[0.1]"
                                        style={{ background: `${course.color}15` }}
                                    >
                                        {course.icon}
                                    </div>
                                    <div>
                                        <span className={`badge text-xs ${difficultyColor(course.difficulty)}`}>
                                            <BarChart2 size={11} />
                                            {difficultyLabel(course.difficulty)}
                                        </span>
                                        <p className="text-xs text-[var(--text-muted)] mt-1.5 capitalize">{course.category}</p>
                                    </div>
                                </div>

                                <h1 className="font-display text-4xl font-700 text-white mb-4">{course.title}</h1>
                                <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
                                    {course.tagline}
                                </p>

                                {/* Quick stats */}
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <BookOpen size={15} className="text-amber-400" />
                                        {course.chapters.length} chapters · {course.totalSections} sections
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Clock size={15} className="text-amber-400" />
                                        {formatReadingTime(course.totalReadingMinutes)} total
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Code2 size={15} className="text-amber-400" />
                                        Hands-on code examples
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Trophy size={15} className="text-amber-400" />
                                        Chapter quizzes
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Brain size={15} className="text-amber-400" />
                                        AI tutor available
                                    </div>
                                </div>
                            </div>

                            {/* Right — Progress widget (client) */}
                            <div>
                                <CourseProgressWidget course={course} startHref={startHref} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container-main py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Chapters list */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="font-display font-700 text-white text-xl mb-6">Course Content</h2>

                            {course.chapters.map((chapter, ci) => (
                                <div
                                    key={chapter.id}
                                    className="border border-white/[0.07] rounded-2xl bg-[#0F0F1A] overflow-hidden"
                                >
                                    {/* Chapter header */}
                                    <div className="flex items-center gap-4 p-5 border-b border-white/[0.06]">
                                        <span className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-xs font-700 text-amber-400">
                                            {String(ci + 1).padStart(2, '0')}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-display font-600 text-white">{chapter.title}</h3>
                                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                                {chapter.sections.length} sections · {formatReadingTime(chapter.totalReadingMinutes)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sections */}
                                    <div className="divide-y divide-white/[0.04]">
                                        {chapter.sections.map((section, si) => (
                                            <Link
                                                key={section.id}
                                                href={`/courses/${course.slug}/${chapter.slug}/${section.slug}`}
                                                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors group"
                                            >
                                                <span className="text-xs text-[var(--text-muted)] w-5 text-right">
                                                    {si + 1}
                                                </span>
                                                <span className="flex-1 text-sm text-[var(--text-secondary)] group-hover:text-white transition-colors">
                                                    {section.title}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    {section.hasCodeExamples && (
                                                        <Code2 size={12} className="text-[var(--text-muted)]" />
                                                    )}
                                                    <span className="text-xs text-[var(--text-muted)]">
                                                        {section.readingTimeMinutes}m
                                                    </span>
                                                    <ChevronRight
                                                        size={14}
                                                        className="text-[var(--text-muted)] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all"
                                                    />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right sidebar */}
                        <div className="space-y-5">
                            {/* Prerequisites */}
                            {course.prerequisites.length > 0 && (
                                <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#0F0F1A]">
                                    <h3 className="font-display font-600 text-white text-sm mb-3">Prerequisites</h3>
                                    <ul className="space-y-2">
                                        {course.prerequisites.map(slug => (
                                            <li key={slug}>
                                                <Link
                                                    href={`/courses/${slug}`}
                                                    className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-amber-400 transition-colors"
                                                >
                                                    <CheckCircle2 size={13} className="text-amber-500" />
                                                    {slug.charAt(0).toUpperCase() + slug.slice(1)}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#0F0F1A]">
                                <h3 className="font-display font-600 text-white text-sm mb-3">Topics Covered</h3>
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 text-xs bg-white/[0.05] border border-white/[0.07] rounded-lg text-[var(--text-secondary)]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Start CTA */}
                            <Link href={startHref} className="btn btn-primary btn-md w-full group">
                                Start Course
                                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}