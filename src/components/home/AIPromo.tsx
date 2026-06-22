
import Link from 'next/link'
import { CheckCircle2, Brain, MessageSquare, Lock } from 'lucide-react'

export function AIPromo() {
    return (
        <section className="py-24 bg-[#0A0A12]">
            <div className="container-main">
                <div className="relative rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#0D1520] to-[#0A0A12] overflow-hidden p-8 md:p-12">

                    {/* Background glow */}
                    <div
                        className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-30 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 65%)' }}
                    />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="text-xs font-semibold text-cyan-400">Free AI Mentor</span>
                            </div>

                            <h2 className="font-display text-3xl sm:text-4xl font-700 text-white mb-5 leading-tight">
                                An AI Tutor That Knows
                                <br />
                                <span className="text-gradient-brand">Your Current Lesson</span>
                            </h2>

                            <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
                                Unlike generic AI chatbots, DevLearn's AI mentor has full context of your
                                current course, chapter, and section. Ask it to explain any concept from the lesson,
                                debug your code, or suggest what to learn next.
                            </p>

                            <ul className="space-y-3 mb-8">
                                {[
                                    'Runs on free local models (Ollama) or free cloud APIs',
                                    'Understands your current lesson context automatically',
                                    'Explains code, concepts, errors, and best practices',
                                    'Suggests learning paths based on your progress',
                                ].map(item => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                                        <CheckCircle2 size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/courses" className="btn btn-accent btn-lg">
                                <MessageSquare size={17} />
                                Try the AI Mentor
                            </Link>
                        </div>

                        {/* Right — Chat preview */}
                        <div className="bg-[#0A0A12] rounded-2xl border border-white/[0.08] overflow-hidden shadow-elevation-4">
                            {/* Chat header */}
                            <div className="flex items-center gap-3 p-4 border-b border-white/[0.08] bg-[#0F0F1A]">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                                    <Brain size={14} className="text-black" />
                                </div>
                                <div>
                                    <p className="text-sm font-600 text-white">DevLearn AI</p>
                                    <p className="text-xs text-cyan-400">Learning: JavaScript → Closures</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs text-emerald-400">Online</span>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="p-4 space-y-4 min-h-[260px]">
                                <ChatBubble
                                    role="user"
                                    text="I don't understand why the counter variable is preserved between calls?"
                                />
                                <ChatBubble
                                    role="ai"
                                    text="Great question! This is the power of closures. When createCounter() runs, it creates a local variable count. Normally that would be garbage collected — but because the returned functions (increment, decrement, getCount) reference count, JavaScript keeps it alive in memory."
                                    code="// count lives in the closure's scope
const counter = createCounter();
counter.increment(); // count is now 1
counter.increment(); // count is now 2
// count is 'remembered' between calls ✓"
                                />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/[0.08]">
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#141420] border border-white/[0.08] rounded-xl">
                                    <span className="text-sm text-[var(--text-muted)] flex-1">Ask about this lesson...</span>
                                    <Lock size={12} className="text-[var(--text-muted)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function ChatBubble({ role, text, code }: { role: 'user' | 'ai'; text: string; code?: string }) {
    if (role === 'user') {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] px-4 py-2.5 bg-amber-500/15 border border-amber-500/20 rounded-2xl rounded-br-sm">
                    <p className="text-sm text-[var(--text-primary)]">{text}</p>
                </div>
            </div>
        )
    }
    return (
        <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex-shrink-0 flex items-center justify-center mt-1">
                <Brain size={12} className="text-black" />
            </div>
            <div className="flex-1">
                <p className="text-sm text-[var(--text-secondary)] mb-2">{text}</p>
                {code && (
                    <pre className="text-xs bg-[#141420] border border-white/[0.07] rounded-lg p-3 text-cyan-300 font-mono overflow-x-auto">
                        {code}
                    </pre>
                )}
            </div>
        </div>
    )
}