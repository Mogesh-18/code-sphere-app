import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { getAllCourses } from '@/lib/content/loader'

export const metadata: Metadata = {
    title: 'My Dashboard',
    description: 'Your personal learning dashboard. Track progress, streaks, and quiz scores.',
}

export default function DashboardPage() {
    const courses = getAllCourses()

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-[var(--nav-height)] bg-[#07070D]">
                <div className="bg-[#0A0A12] border-b border-white/[0.06] py-12">
                    <div className="container-main">
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
                            Learning Dashboard
                        </p>
                        <h1 className="font-display text-3xl font-700 text-white">
                            Your Progress
                        </h1>
                    </div>
                </div>
                <div className="container-main py-10">
                    <DashboardClient courses={courses} />
                </div>
            </main>
            <Footer />
        </>
    )
}