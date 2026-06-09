'use client'

import {
    Code2, Brain, Trophy, BarChart2, Zap, BookOpen,
} from 'lucide-react'

const FEATURES = [
    {
        icon: Code2,
        title: 'Interactive Playground',
        description: 'Write and run HTML, CSS, JS, jQuery, and PHP directly in the browser. No setup required.',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
    },
    {
        icon: Brain,
        title: 'AI Learning Mentor',
        description: 'Free AI assistant that understands your current lesson context. Ask anything, anytime.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
    },
    {
        icon: Trophy,
        title: 'Knowledge Quizzes',
        description: 'Test your understanding with dynamic quizzes after each chapter. Track your scores over time.',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
    },
    {
        icon: BarChart2,
        title: 'Progress Tracking',
        description: 'Your learning journey tracked automatically. Streaks, completion, time spent — all measured.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
    },
    {
        icon: BookOpen,
        title: 'Professional Content',
        description: 'Guides written as internal onboarding docs — the standard expected by senior engineers.',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
    },
    {
        icon: Zap,
        title: 'Syntax Highlighting',
        description: 'Beautiful, accurate syntax highlighting for every code example. Copy with one click.',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
    },
]

export function Features() {
    return (
        <section className="py-24">
            <div className="container-main">
                <div className="text-center mb-14">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">
                        Platform Features
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl font-700 text-white mb-4">
                        Everything You Need to Level Up
                    </h2>
                    <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
                        Built specifically for developers. Not a generic LMS. Not a knowledge base.
                        A focused environment for engineering growth.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
                        <div
                            key={title}
                            className="p-6 rounded-2xl border border-white/[0.07] bg-[#0F0F1A] hover:border-white/[0.12] transition-all group"
                        >
                            <div className={`inline-flex p-3 rounded-xl ${bg} border border-white/[0.06] mb-4`}>
                                <Icon size={20} className={color} />
                            </div>
                            <h3 className="font-display font-600 text-white text-[1.05rem] mb-2">{title}</h3>
                            <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
