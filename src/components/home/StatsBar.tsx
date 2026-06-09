import { BookOpen, Clock, Code2, Brain } from 'lucide-react'
import type { CourseMetadata } from '@/types/content'

interface StatsBarProps {
    courses: CourseMetadata[]
}

export function StatsBar({ courses }: StatsBarProps) {
    const totalSections = courses.reduce((s, c) => s + c.totalSections, 0)
    const totalMinutes = courses.reduce((s, c) => s + c.totalReadingMinutes, 0)
    const totalHours = Math.round(totalMinutes / 60)

    const stats = [
        { icon: BookOpen, value: `${courses.length}`, label: 'Complete Guides', color: 'text-amber-400' },
        { icon: Code2, value: '500+', label: 'Code Examples', color: 'text-cyan-400' },
        { icon: Clock, value: `${totalHours}h+`, label: 'Learning Content', color: 'text-purple-400' },
        { icon: Brain, value: 'Free', label: 'AI Tutor Included', color: 'text-emerald-400' },
    ]

    return (
        <section className="relative z-10 -mt-10 pb-6">
            <div className="container-main">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
                    {stats.map(({ icon: Icon, value, label, color }, i) => (
                        <div
                            key={label}
                            className="bg-[#0F0F1A] px-6 py-5 flex items-center gap-4 hover:bg-[#141420] transition-colors"
                        >
                            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                <Icon size={18} className={color} />
                            </div>
                            <div>
                                <div className="font-display font-700 text-white text-xl leading-none">
                                    {value}
                                </div>
                                <div className="text-xs text-[var(--text-tertiary)] mt-1">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}