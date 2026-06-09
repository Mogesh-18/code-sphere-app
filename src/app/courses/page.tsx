import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CourseGrid } from '@/components/courses/CourseGrid'
import { getAllCourses } from '@/lib/content/loader'

export const metadata: Metadata = {
    title: 'All Courses',
    description: 'Browse all professional developer guides — HTML, CSS, JavaScript, jQuery, PHP, and Laravel.',
}

export default function CoursesPage() {
    const courses = getAllCourses()

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-[var(--nav-height)]">
                {/* Page header */}
                <div className="bg-[#0A0A12] border-b border-white/[0.06] py-16">
                    <div className="container-main">
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
                            All Courses
                        </p>
                        <h1 className="font-display text-4xl font-700 text-white mb-4">
                            Developer Learning Library
                        </h1>
                        <p className="text-[var(--text-secondary)] max-w-xl">
                            Professional-grade guides built for real-world development.
                            Written to the standard senior engineers expect from new team members.
                        </p>
                    </div>
                </div>

                {/* Courses */}
                <div className="container-main py-12">
                    <Suspense>
                        <CourseGrid courses={courses} />
                    </Suspense>
                </div>
            </main>
            <Footer />
        </>
    )
}