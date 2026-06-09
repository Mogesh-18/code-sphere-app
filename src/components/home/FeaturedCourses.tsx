import Link from 'next/link'
import { ArrowRight, Clock, BookOpen, BarChart2 } from 'lucide-react'
import type { CourseMetadata } from '@/types/content'
import { formatReadingTime, difficultyLabel, difficultyColor } from '@/lib/utils'

interface FeaturedCoursesProps {
    courses: CourseMetadata[]
}

export function FeaturedCourses({ courses }: FeaturedCoursesProps) {
    return (
        <section className="py-24">
            <div className="container-main">

                {/* Header */}
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
                            Learning Paths
                        </p>
                        <h2 className="font-display text-3xl sm:text-4xl font-700 text-white">
                            All Courses
                        </h2>
                        <p className="text-[var(--text-secondary)] mt-3 max-w-xl">
                            Professional-grade guides written like internal onboarding documentation.
                            No fluff, no beginner-bait — just real engineering knowledge.
                        </p>
                    </div>
                    <Link
                        href="/courses"
                        className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors group"
                    >
                        View all
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Course grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {courses.map((course, i) => (
                        <CourseCard key={course.slug} course={course} index={i} />
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-10 text-center sm:hidden">
                    <Link href="/courses" className="btn btn-secondary btn-md">
                        View all courses
                        <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        </section>
    )
}

function CourseCard({ course, index }: { course: CourseMetadata; index: number }) {
    return (
        <Link
            href={`/courses/${course.slug}`}
            className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-[#0F0F1A] overflow-hidden hover:border-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(245,158,11,0.08)]"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Card accent bar */}
            <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${course.color}, transparent)` }}
            />

            <div className="p-6 flex flex-col flex-1">

                {/* Icon + difficulty */}
                <div className="flex items-center justify-between mb-5">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/[0.07]"
                        style={{ background: `${course.color}15` }}
                    >
                        {course.icon}
                    </div>
                    <span className={`badge text-xs ${difficultyColor(course.difficulty)}`}>
                        <BarChart2 size={11} />
                        {difficultyLabel(course.difficulty)}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-display font-700 text-white text-lg leading-tight mb-2 group-hover:text-amber-200 transition-colors">
                    {course.title}
                </h3>

                {/* Tagline */}
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-5 flex-1">
                    {course.tagline}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {course.tags.slice(0, 3).map(tag => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 text-2xs font-medium bg-white/[0.04] border border-white/[0.07] rounded-md text-[var(--text-muted)]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Footer stats */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                        <BookOpen size={12} />
                        <span>{course.chapterCount} chapters</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                        <Clock size={12} />
                        <span>{formatReadingTime(course.totalReadingMinutes)}</span>
                    </div>
                    <div className="ml-auto">
                        <ArrowRight
                            size={15}
                            className="text-[var(--text-muted)] group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
                        />
                    </div>
                </div>
            </div>
        </Link>
    )
}