'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, ChevronRight, Code2, Zap, Star } from 'lucide-react'
import { motion } from 'framer-motion'

const TECH_PILLS = ['HTML5', 'CSS3', 'JavaScript', 'jQuery', 'PHP', 'Laravel']

export function Hero() {
    return (
        <section className="relative min-h-[100svh] flex items-center overflow-hidden">

            {/* Background layers */}
            <div className="absolute inset-0 bg-[#07070D]" />

            {/* Radial glow - top left */}
            <div
                className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%)',
                }}
            />

            {/* Radial glow - bottom right */}
            <div
                className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)',
                }}
            />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
                    backgroundSize: '60px 60px',
                }}
            />

            <div className="container-main relative z-10 pt-32 pb-24">
                <div className="max-w-4xl">

                    {/* Top badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8"
                    >
                        <Sparkles size={13} className="text-amber-400" />
                        <span className="text-xs font-semibold text-amber-400 tracking-wide uppercase">
                            Professional Developer Training
                        </span>
                        <span className="w-px h-3 bg-amber-500/30" />
                        <span className="text-xs text-amber-400/70">6 Complete Guides</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-display text-5xl sm:text-6xl lg:text-7xl font-800 leading-[1.05] tracking-tight mb-6"
                    >
                        <span className="text-white">Master the</span>
                        <br />
                        <span className="text-gradient-brand">Modern Web</span>
                        <br />
                        <span className="text-white">Stack.</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-10"
                    >
                        From HTML fundamentals to Laravel APIs — learn with professional-grade
                        guides built by senior engineers. Interactive examples, quizzes, and
                        an AI mentor to accelerate your growth.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-wrap gap-4 mb-14"
                    >
                        <Link href="/courses" className="btn btn-primary btn-lg group">
                            Explore Courses
                            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/playground" className="btn btn-secondary btn-lg">
                            <Code2 size={17} />
                            Try Playground
                        </Link>
                    </motion.div>

                    {/* Tech pills */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="flex flex-wrap gap-2"
                    >
                        <span className="text-xs text-[var(--text-muted)] flex items-center mr-1">
                            Covers:
                        </span>
                        {TECH_PILLS.map((tech, i) => (
                            <motion.span
                                key={tech}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.07 }}
                                className="px-3 py-1 text-xs font-medium bg-white/[0.05] border border-white/[0.08] rounded-full text-[var(--text-secondary)] hover:border-amber-500/30 hover:text-amber-400 transition-all cursor-default"
                            >
                                {tech}
                            </motion.span>
                        ))}
                    </motion.div>

                </div>

                {/* Floating stat cards */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col gap-4 pr-4"
                >
                    <FloatCard
                        icon={<Code2 size={18} className="text-amber-400" />}
                        value="500+"
                        label="Code Examples"
                        color="amber"
                    />
                    <FloatCard
                        icon={<Zap size={18} className="text-cyan-400" />}
                        value="6"
                        label="Complete Guides"
                        color="cyan"
                    />
                    <FloatCard
                        icon={<Star size={18} className="text-purple-400 fill-purple-400" />}
                        value="AI"
                        label="Mentor Included"
                        color="purple"
                    />
                </motion.div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#07070D] to-transparent pointer-events-none" />
        </section>
    )
}

function FloatCard({
    icon, value, label, color,
}: {
    icon: React.ReactNode
    value: string
    label: string
    color: 'amber' | 'cyan' | 'purple'
}) {
    const bg = {
        amber: 'bg-amber-500/10 border-amber-500/20',
        cyan: 'bg-cyan-500/10 border-cyan-500/20',
        purple: 'bg-purple-500/10 border-purple-500/20',
    }[color]

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} backdrop-blur-sm`}
        >
            <div className="p-2 rounded-lg bg-white/[0.05]">{icon}</div>
            <div>
                <div className="font-display font-700 text-white text-lg leading-none">{value}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{label}</div>
            </div>
        </div>
    )
}