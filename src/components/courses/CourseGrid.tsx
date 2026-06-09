'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    Search, Filter, Clock, BookOpen, BarChart2, ArrowRight, X,
} from 'lucide-react'
import type { CourseMetadata } from '@/types/content'
import { cn, difficultyColor, difficultyLabel, formatReadingTime } from '@/lib/utils'
import { useProgressStore } from '@/lib/progress/store'

interface CourseGridProps {
    courses: CourseMetadata[]
}

const DIFFICULTY_OPTIONS = ['all', 'beginner', 'intermediate', 'advanced'] as const
const CATEGORY_OPTIONS = ['all', 'frontend', 'backend', 'language', 'framework'] as const

type DifficultyFilter = typeof DIFFICULTY_OPTIONS[number]
type CategoryFilter = typeof CATEGORY_OPTIONS[number]

export function CourseGrid({ courses }: CourseGridProps) {
    const [search, setSearch] = useState('')
    const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
    const [category, setCategory] = useState<CategoryFilter>('all')
    const progressCourses = useProgressStore(s => s.courses)

    const filtered = useMemo(() => {
        return courses.filter(c => {
            const matchesSearch =
                !search ||
                c.title.toLowerCase().includes(search.toLowerCase()) ||
                c.tagline.toLowerCase().includes(search.toLowerCase()) ||
                c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))

            const matchesDifficulty = difficulty === 'all' || c.difficulty === difficulty
            const matchesCategory = category === 'all' || c.category === category

            return matchesSearch && matchesDifficulty && matchesCategory
        })
    }, [courses, search, difficulty, category])

    const hasFilters = search || difficulty !== 'all' || category !== 'all'

    return (
        <div>
            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#0F0F1A] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-[var(--text-muted)] focus:border-amber-500/40 focus:outline-none transition-colors"
                    />
                </div>

                {/* Difficulty */}
                <div className="flex items-center gap-2">
                    {DIFFICULTY_OPTIONS.map(d => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={cn(
                                'px-3 py-2 rounded-lg text-xs font-medium border transition-all capitalize',
                                difficulty === d
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-[#0F0F1A] text-[var(--text-secondary)] border-white/[0.07] hover:border-white/[0.14]'
                            )}
                        >
                            {d === 'all' ? 'All Levels' : d}
                        </button>
                    ))}
                </div>

                {/* Clear */}
                {hasFilters && (
                    <button
                        onClick={() => { setSearch(''); setDifficulty('all'); setCategory('all') }}
                        className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-white transition-colors"
                    >
                        <X size={13} /> Clear
                    </button>
                )}
            </div>

            {/* Results count */}
            <p className="text-sm text-[var(--text-tertiary)] mb-6">
                {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
            </p>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(course => {
                        const progress = progressCourses[course.slug]
                        const pct = progress?.completionPercentage ?? 0

                        return (
                            <Link
                                key={course.slug}
                                href={`/courses/${course.slug}`}
                                className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-[#0F0F1A] overflow-hidden hover:border-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                            >
                                {/* Color bar */}
                                <div
                                    className="h-0.5 w-full"
                                    style={{ background: `linear-gradient(90deg, ${course.color}, transparent 80%)` }}
                                />

                                <div className="p-6 flex flex-col flex-1">
                                    {/* Icon + badge */}
                                    <div className="flex items-start justify-between mb-5">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/[0.07]"
                                            style={{ background: `${course.color}12` }}
                                        >
                                            {course.icon}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`badge text-xs ${difficultyColor(course.difficulty)}`}>
                                                {difficultyLabel(course.difficulty)}
                                            </span>
                                            {pct > 0 && (
                                                <span className="text-xs text-emerald-400 font-600">{pct}% done</span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-display font-700 text-white text-lg mb-2 group-hover:text-amber-200 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-5 flex-1">
                                        {course.tagline}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        {course.tags.slice(0, 4).map(tag => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 text-2xs bg-white/[0.04] border border-white/[0.06] rounded text-[var(--text-muted)]"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Progress bar */}
                                    {pct > 0 && (
                                        <div className="progress-bar mb-4">
                                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                                        <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                                            <BookOpen size={12} />
                                            {course.chapterCount} chapters
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                                            <Clock size={12} />
                                            {formatReadingTime(course.totalReadingMinutes)}
                                        </span>
                                        <ArrowRight
                                            size={14}
                                            className="ml-auto text-[var(--text-muted)] group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
                                        />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-20">
                    <Search size={36} className="text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="font-display font-600 text-white text-lg mb-2">No courses found</h3>
                    <p className="text-sm text-[var(--text-tertiary)]">
                        Try adjusting your search or filters.
                    </p>
                </div>
            )}
        </div>
    )
}