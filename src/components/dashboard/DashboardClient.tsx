'use client'

import Link from 'next/link'
import {
    BookOpen, Clock, Trophy, Flame, Target, TrendingUp,
    CheckCircle2, ArrowRight, BarChart2, Calendar, Zap,
} from 'lucide-react'
import type { CourseMetadata } from '@/types/content'
import { useProgressStore } from '@/lib/progress/store'
import { formatTimeSpent, formatRelativeTime, cn } from '@/lib/utils'

interface Props {
    courses: CourseMetadata[]
}

export function DashboardClient({ courses }: Props) {
    const { stats, courses: coursesProgress, quizAttempts } = useProgressStore()
    const hasProgress = Object.keys(coursesProgress).length > 0

    const activeCourses = courses
        .filter(c => coursesProgress[c.slug])
        .sort((a, b) =>
            (coursesProgress[b.slug]?.lastAccessedAt ?? '').localeCompare(
                coursesProgress[a.slug]?.lastAccessedAt ?? ''
            )
        )

    const bestQuizScore = quizAttempts.length
        ? Math.max(...quizAttempts.map(a => a.score))
        : 0

    if (!hasProgress) {
        return <EmptyDashboard />
    }

    return (
        <div className="space-y-8">

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<Flame size={20} className="text-orange-400 fill-orange-400/30" />}
                    value={stats.streak.currentStreak}
                    label="Day Streak"
                    sub={stats.streak.longestStreak > 0 ? `Best: ${stats.streak.longestStreak}` : undefined}
                    highlight
                    color="orange"
                />
                <StatCard
                    icon={<CheckCircle2 size={20} className="text-emerald-400" />}
                    value={stats.totalSectionsCompleted}
                    label="Sections Done"
                    color="emerald"
                />
                <StatCard
                    icon={<Clock size={20} className="text-cyan-400" />}
                    value={formatTimeSpent(stats.totalTimeSpentSeconds)}
                    label="Time Invested"
                    color="cyan"
                />
                <StatCard
                    icon={<Trophy size={20} className="text-amber-400 fill-amber-400/30" />}
                    value={bestQuizScore > 0 ? `${bestQuizScore}%` : '—'}
                    label="Best Quiz Score"
                    color="amber"
                />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Courses in progress */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-display font-600 text-white text-lg flex items-center gap-2">
                        <BookOpen size={18} className="text-amber-400" />
                        In Progress
                    </h2>

                    {activeCourses.length > 0 ? (
                        activeCourses.map(course => {
                            const progress = coursesProgress[course.slug]!
                            return (
                                <Link
                                    key={course.slug}
                                    href={
                                        progress.lastChapterSlug
                                            ? `/courses/${course.slug}/${progress.lastChapterSlug}/${course.slug // placeholder — actual section slug would come from course data
                                            }`
                                            : `/courses/${course.slug}`
                                    }
                                    className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#0F0F1A] hover:border-amber-500/25 transition-all group"
                                >
                                    {/* Icon */}
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-white/[0.07]"
                                        style={{ background: `${course.color}12` }}
                                    >
                                        {course.icon}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <h3 className="font-display font-600 text-white text-sm truncate">{course.title}</h3>
                                            <span className="text-xs text-amber-400 font-600 flex-shrink-0 ml-2">
                                                {progress.completionPercentage}%
                                            </span>
                                        </div>
                                        <div className="progress-bar mb-1.5">
                                            <div className="progress-fill" style={{ width: `${progress.completionPercentage}%` }} />
                                        </div>
                                        <p className="text-2xs text-[var(--text-muted)]">
                                            {progress.completedSectionIds.length}/{progress.totalSections} sections ·{' '}
                                            {formatRelativeTime(progress.lastAccessedAt)}
                                        </p>
                                    </div>

                                    <ArrowRight
                                        size={15}
                                        className="text-[var(--text-muted)] group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0"
                                    />
                                </Link>
                            )
                        })
                    ) : (
                        <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                            <BookOpen size={24} className="mx-auto mb-2 opacity-40" />
                            No courses in progress
                        </div>
                    )}

                    {/* Browse more */}
                    <Link
                        href="/courses"
                        className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                        Browse all courses <ArrowRight size={13} />
                    </Link>
                </div>

                {/* Right column */}
                <div className="space-y-5">
                    {/* Streak calendar */}
                    <StreakCalendar activeDays={stats.streak.activeDays} />

                    {/* Quiz history */}
                    {quizAttempts.length > 0 && (
                        <div className="p-5 rounded-xl border border-white/[0.07] bg-[#0F0F1A]">
                            <h3 className="font-display font-600 text-white text-sm mb-4 flex items-center gap-2">
                                <Trophy size={15} className="text-amber-400" />
                                Recent Quizzes
                            </h3>
                            <div className="space-y-3">
                                {quizAttempts.slice(-5).reverse().map(attempt => (
                                    <div key={attempt.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-[var(--text-secondary)] capitalize">
                                                {attempt.courseSlug}
                                            </p>
                                            <p className="text-2xs text-[var(--text-muted)]">
                                                {attempt.correctAnswers}/{attempt.totalQuestions} correct
                                            </p>
                                        </div>
                                        <span className={cn(
                                            'text-sm font-700',
                                            attempt.score >= 80 ? 'text-emerald-400' :
                                                attempt.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                                        )}>
                                            {attempt.score}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Overall stats */}
                    <div className="p-5 rounded-xl border border-white/[0.07] bg-[#0F0F1A]">
                        <h3 className="font-display font-600 text-white text-sm mb-4 flex items-center gap-2">
                            <TrendingUp size={15} className="text-cyan-400" />
                            Overall Stats
                        </h3>
                        <div className="space-y-3 text-sm">
                            {[
                                { label: 'Courses started', value: stats.totalCoursesStarted },
                                { label: 'Courses completed', value: stats.totalCoursesCompleted },
                                { label: 'Quizzes taken', value: stats.totalQuizzesTaken },
                                { label: 'Avg quiz score', value: stats.averageQuizScore > 0 ? `${stats.averageQuizScore}%` : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center">
                                    <span className="text-[var(--text-muted)]">{label}</span>
                                    <span className="font-600 text-white">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────────
// Stat card
// ──────────────────────────────────────────────────

function StatCard({
    icon, value, label, sub, highlight, color,
}: {
    icon: React.ReactNode
    value: string | number
    label: string
    sub?: string
    highlight?: boolean
    color: 'orange' | 'emerald' | 'cyan' | 'amber'
}) {
    const borders: Record<string, string> = {
        orange: 'border-orange-500/20',
        emerald: 'border-emerald-500/20',
        cyan: 'border-cyan-500/20',
        amber: 'border-amber-500/20',
    }

    return (
        <div className={cn(
            'p-5 rounded-xl border bg-[#0F0F1A]',
            highlight ? borders[color] : 'border-white/[0.07]'
        )}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/[0.04]">{icon}</div>
            </div>
            <p className="font-display font-700 text-white text-2xl leading-none">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
            {sub && <p className="text-2xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
        </div>
    )
}

// ──────────────────────────────────────────────────
// 30-day activity calendar
// ──────────────────────────────────────────────────

function StreakCalendar({ activeDays }: { activeDays: string[] }) {
    const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (29 - i))
        return d.toISOString().split('T')[0]
    })

    return (
        <div className="p-5 rounded-xl border border-white/[0.07] bg-[#0F0F1A]">
            <h3 className="font-display font-600 text-white text-sm mb-4 flex items-center gap-2">
                <Calendar size={15} className="text-amber-400" />
                30-Day Activity
            </h3>
            <div className="grid grid-cols-10 gap-1">
                {days.map(day => {
                    const isActive = activeDays.includes(day)
                    const isToday = day === new Date().toISOString().split('T')[0]
                    return (
                        <div
                            key={day}
                            title={day}
                            className={cn(
                                'w-full aspect-square rounded-sm transition-all',
                                isActive
                                    ? 'bg-amber-500/70'
                                    : 'bg-white/[0.05]',
                                isToday && 'ring-1 ring-amber-400/50'
                            )}
                        />
                    )
                })}
            </div>
            <p className="text-2xs text-[var(--text-muted)] mt-3">
                Each square = 1 day of activity
            </p>
        </div>
    )
}

// ──────────────────────────────────────────────────
// Empty state
// ──────────────────────────────────────────────────

function EmptyDashboard() {
    return (
        <div className="text-center py-20">
            <div className="inline-flex p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 mb-6">
                <Zap size={40} className="text-amber-400" />
            </div>
            <h2 className="font-display text-2xl font-700 text-white mb-3">
                Start Your Learning Journey
            </h2>
            <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-8">
                Pick a course and start learning. Your progress, streaks, and quiz scores
                will all appear here.
            </p>
            <Link href="/courses" className="btn btn-primary btn-lg group">
                Browse Courses
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    )
}