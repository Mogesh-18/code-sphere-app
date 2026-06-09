
import Link from 'next/link'
import {
    Zap, ArrowRight, Play,
} from 'lucide-react'

export function CallToAction() {
    return (
        <section className="py-24">
            <div className="container-main">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8">
                        <Zap size={13} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-amber-400">Start for Free</span>
                    </div>

                    <h2 className="font-display text-4xl sm:text-5xl font-700 text-white mb-5 leading-tight">
                        Ready to Level Up
                        <br />
                        <span className="text-gradient-brand">Your Skills?</span>
                    </h2>

                    <p className="text-[var(--text-secondary)] text-lg mb-10">
                        Join developers who are taking their craft seriously.
                        No account required. Start learning right now.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/courses" className="btn btn-primary btn-lg group">
                            Browse All Courses
                            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/playground" className="btn btn-secondary btn-lg">
                            <Play size={16} />
                            Open Playground
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}