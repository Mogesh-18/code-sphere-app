"use client";

import Link from 'next/link'
import {
    ArrowRight, Play,
} from 'lucide-react'
import { useProgressStore } from '@/lib/progress/store'

export function ContinueLearningBanner() {
    const courses = useProgressStore(s => s.courses)
    const hasProgress = Object.keys(courses).length > 0

    if (!hasProgress) return null

    const recent = Object.values(courses)
        .sort((a, b) => b.lastAccessedAt.localeCompare(a.lastAccessedAt))
        .slice(0, 1)[0]

    return (
        <div className="container-main pt-8">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="p-2 rounded-lg bg-amber-500/20">
                    <Play size={16} className="text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-white">Continue learning</p>
                    <p className="text-xs text-amber-400/70 truncate">
                        {recent.courseSlug} — {recent.completionPercentage}% complete
                    </p>
                </div>
                <Link
                    href={`/courses/${recent.courseSlug}${recent.lastChapterSlug ? `/${recent.lastChapterSlug}` : ''}`}
                    className="flex-shrink-0 text-xs font-600 text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                    Resume <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    )
}