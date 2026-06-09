'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BookOpen, LayoutDashboard, Code2, Zap, Menu, X, ChevronDown, Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProgressStore } from '@/lib/progress/store'

const NAV_LINKS = [
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/playground', label: 'Playground', icon: Code2 },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export function Navbar() {
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const streak = useProgressStore(s => s.stats.streak)

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handler, { passive: true })
        return () => window.removeEventListener('scroll', handler)
    }, [])

    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                    scrolled
                        ? 'bg-[#0A0A12]/90 backdrop-blur-xl border-b border-white/[0.06]'
                        : 'bg-transparent'
                )}
                style={{ height: 'var(--nav-height)' }}
            >
                <div className="container-main h-full flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-amber-500/20 rounded-lg blur-sm group-hover:bg-amber-500/30 transition-all" />
                            <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg w-8 h-8 flex items-center justify-center">
                                <Zap size={16} className="text-black fill-black" />
                            </div>
                        </div>
                        <span className="font-display font-700 text-[1.15rem] tracking-tight text-white">
                            Dev<span className="text-amber-400">Learn</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href || pathname.startsWith(href + '/')
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                                        isActive
                                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                            : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06]'
                                    )}
                                >
                                    <Icon size={15} />
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Streak badge */}
                        {streak.currentStreak > 0 && (
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                                <Flame size={13} className="text-amber-400 fill-amber-400" />
                                <span className="text-xs font-semibold text-amber-400">
                                    {streak.currentStreak}
                                </span>
                            </div>
                        )}

                        <Link
                            href="/courses"
                            className="hidden md:flex btn btn-primary btn-sm gap-2"
                        >
                            Start Learning
                        </Link>

                        {/* Mobile menu toggle */}
                        <button
                            className="md:hidden p-2 rounded-lg bg-white/[0.05] border border-white/10 text-white"
                            onClick={() => setMobileOpen(v => !v)}
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile menu */}
            <div
                className={cn(
                    'fixed inset-0 z-40 md:hidden transition-all duration-300',
                    mobileOpen ? 'visible opacity-100' : 'invisible opacity-0'
                )}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />

                {/* Drawer */}
                <div
                    className={cn(
                        'absolute top-0 right-0 bottom-0 w-72 bg-[#0F0F1A] border-l border-white/[0.08] p-6',
                        'transition-transform duration-300',
                        mobileOpen ? 'translate-x-0' : 'translate-x-full'
                    )}
                >
                    <div className="mt-12 space-y-1">
                        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href || pathname.startsWith(href + '/')
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-amber-500/15 text-amber-400'
                                            : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06]'
                                    )}
                                >
                                    <Icon size={17} />
                                    {label}
                                </Link>
                            )
                        })}
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/[0.08]">
                        <Link href="/courses" className="btn btn-primary btn-md w-full">
                            Start Learning
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}