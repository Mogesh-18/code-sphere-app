import Link from 'next/link'
import { ArrowRight, Layers, Server, Globe } from 'lucide-react'

const PATHS = [
    {
        id: 'frontend',
        title: 'Frontend Developer',
        description: 'Master the complete frontend stack from HTML structure to modern JavaScript patterns.',
        icon: Globe,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        gradient: 'from-amber-500/20 to-transparent',
        courses: ['HTML5', 'CSS', 'JavaScript', 'jQuery'],
        weeks: 10,
        level: 'Beginner → Intermediate',
        href: '/courses?path=frontend',
    },
    {
        id: 'backend',
        title: 'Backend Developer',
        description: 'Build robust server-side applications with PHP and the Laravel framework.',
        icon: Server,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        gradient: 'from-purple-500/20 to-transparent',
        courses: ['HTML5', 'PHP', 'Laravel'],
        weeks: 8,
        level: 'Beginner → Advanced',
        href: '/courses?path=backend',
    },
    {
        id: 'fullstack',
        title: 'Full Stack Developer',
        description: 'Complete journey from browser basics to production-grade full stack applications.',
        icon: Layers,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        gradient: 'from-cyan-500/20 to-transparent',
        courses: ['HTML5', 'CSS', 'JavaScript', 'PHP', 'Laravel'],
        weeks: 16,
        level: 'Beginner → Advanced',
        href: '/courses?path=fullstack',
    },
]

export function LearningPaths() {
    return (
        <section className="py-24 bg-[#0A0A12]">
            <div className="container-main">

                {/* Header */}
                <div className="text-center mb-14">
                    <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
                        Structured Learning
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl font-700 text-white mb-4">
                        Choose Your Path
                    </h2>
                    <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
                        Curated course sequences designed to take you from zero to production-ready.
                        Follow the path or forge your own.
                    </p>
                </div>

                {/* Paths grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PATHS.map(path => {
                        const Icon = path.icon
                        return (
                            <div
                                key={path.id}
                                className={`relative rounded-2xl border ${path.border} bg-[#0F0F1A] overflow-hidden group hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300`}
                            >
                                {/* Gradient overlay */}
                                <div
                                    className={`absolute top-0 left-0 right-0 h-40 bg-gradient-to-b ${path.gradient} pointer-events-none`}
                                />

                                <div className="relative p-7">
                                    {/* Icon */}
                                    <div className={`inline-flex p-3 rounded-xl ${path.bg} border ${path.border} mb-5`}>
                                        <Icon size={22} className={path.color} />
                                    </div>

                                    {/* Title + level */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className="font-display font-700 text-white text-xl">{path.title}</h3>
                                    </div>

                                    <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-6">
                                        {path.description}
                                    </p>

                                    {/* Course sequence */}
                                    <div className="flex items-center gap-2 flex-wrap mb-6">
                                        {path.courses.map((course, i) => (
                                            <div key={course} className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 text-xs font-medium bg-white/[0.06] border border-white/[0.08] rounded-lg text-[var(--text-secondary)]">
                                                    {course}
                                                </span>
                                                {i < path.courses.length - 1 && (
                                                    <ArrowRight size={11} className="text-[var(--text-muted)]" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-5 border-t border-white/[0.06]">
                                        <div>
                                            <p className="text-xs text-[var(--text-muted)]">Est. duration</p>
                                            <p className="text-sm font-600 text-white mt-0.5">{path.weeks} weeks</p>
                                        </div>
                                        <Link
                                            href={path.href}
                                            className={`flex items-center gap-2 text-sm font-600 ${path.color} hover:gap-3 transition-all`}
                                        >
                                            Start path
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>
        </section>
    )
}