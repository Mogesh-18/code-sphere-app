import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { ArrowLeft, Zap } from 'lucide-react'

export default function NotFound() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-[var(--nav-height)] bg-[#07070D] flex items-center justify-center">
                <div className="text-center px-6">
                    <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
                        <Zap size={36} className="text-amber-400" />
                    </div>
                    <h1 className="font-display text-6xl font-800 text-white mb-3">404</h1>
                    <h2 className="font-display text-2xl font-600 text-[var(--text-secondary)] mb-5">
                        Page Not Found
                    </h2>
                    <p className="text-[var(--text-tertiary)] max-w-sm mx-auto mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Link href="/" className="btn btn-primary btn-lg">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </main>
        </>
    )
}