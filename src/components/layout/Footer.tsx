import Link from 'next/link'
import { Zap, Github, Twitter, ExternalLink } from 'lucide-react'

const FOOTER_LINKS = {
    Courses: [
        { label: 'HTML5', href: '/courses/html' },
        { label: 'CSS', href: '/courses/css' },
        { label: 'JavaScript', href: '/courses/javascript' },
        { label: 'jQuery', href: '/courses/jquery' },
        { label: 'PHP', href: '/courses/php' },
        { label: 'Laravel', href: '/courses/laravel' },
    ],
    Platform: [
        { label: 'All Courses', href: '/courses' },
        { label: 'Playground', href: '/playground' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Learning Paths', href: '/courses#paths' },
    ],
    Resources: [
        { label: 'Code Examples', href: '/playground' },
        { label: 'Quizzes', href: '/courses' },
        { label: 'Progress Tracking', href: '/dashboard' },
        { label: 'AI Assistant', href: '/courses' },
    ],
}

export function Footer() {
    return (
        <footer className="border-t border-white/[0.06] bg-[#0A0A12] mt-24">
            <div className="container-main py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg w-8 h-8 flex items-center justify-center">
                                <Zap size={15} className="text-black fill-black" />
                            </div>
                            <span className="font-display font-700 text-[1.1rem]">
                                Dev<span className="text-amber-400">Learn</span>
                            </span>
                        </Link>
                        <p className="text-[var(--text-tertiary)] text-sm leading-relaxed max-w-xs">
                            Professional developer learning platform. Built for engineers,
                            by engineers. Master the modern web stack at your own pace.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[var(--text-tertiary)] hover:text-white hover:border-white/20 transition-all"
                                aria-label="GitHub"
                            >
                                <Github size={16} />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[var(--text-tertiary)] hover:text-white hover:border-white/20 transition-all"
                                aria-label="Twitter"
                            >
                                <Twitter size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="font-display font-600 text-sm text-white mb-4">{title}</h3>
                            <ul className="space-y-2.5">
                                {links.map(({ label, href }) => (
                                    <li key={label}>
                                        <Link
                                            href={href}
                                            className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[var(--text-muted)]">
                        © {new Date().getFullYear()} DevLearn. Built for developers who take their craft seriously.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <span>Made with</span>
                        <span className="text-amber-500">♥</span>
                        <span>using Next.js 14</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}