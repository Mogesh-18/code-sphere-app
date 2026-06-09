'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Clock, Play } from 'lucide-react'
import type { Course } from '@/types/content'
import { useProgressStore } from '@/lib/progress/store'
import { formatReadingTime } from '@/lib/utils'

interface Props {
    course: Course
    startHref: string
}

export function CourseProgressWidget({ course, startHref }: Props) {
    const courseProgress = useProgressStore(s => s.courses[course.slug])
    const pct = courseProgress?.completionPercentage ?? 0
    const started = !!courseProgress

    const continueHref = courseProgress?.lastChapterSlug && courseProgress?.lastSectionId
        ? `/courses/${course.slug}/${courseProgress.lastChapterSlug}/${course.chapters
            .find(c => c.slug === courseProgress.lastChapterSlug)
            ?.sections.find(s => s.id === courseProgress.lastSectionId)
            ?.slug ?? ''
        }`
        : startHref

    return (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0F0F1A] overflow-hidden">
            {/* Color accent */}
            <div
                className="h-1"
                style={{ background: `linear-gradient(90deg, ${course.color}, ${course.color}33)` }}
            />

            <div className="p-6">
                {/* Progress */}
                {started && (
                    <div className="mb-5">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-[var(--text-muted)]">Your progress</span>
                            <span className="text-amber-400 font-600">{pct}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        {courseProgress?.completedSectionIds && (
                            <p className="text-xs text-[var(--text-muted)] mt-1.5">
                                {courseProgress.completedSectionIds.length} of {course.totalSections} sections complete
                            </p>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <BookOpen size={14} className="text-amber-400 mb-1.5" />
                        <p className="text-sm font-600 text-white">{course.chapters.length}</p>
                        <p className="text-xs text-[var(--text-muted)]">Chapters</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <Clock size={14} className="text-amber-400 mb-1.5" />
                        <p className="text-sm font-600 text-white">{formatReadingTime(course.totalReadingMinutes)}</p>
                        <p className="text-xs text-[var(--text-muted)]">Est. time</p>
                    </div>
                </div>

                {/* CTA */}
                <Link
                    href={started ? continueHref : startHref}
                    className="btn btn-primary btn-md w-full group"
                >
                    <Play size={15} fill="currentColor" className="opacity-80" />
                    {started ? 'Continue Learning' : 'Start Course'}
                    <ArrowRight size={14} className="ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}