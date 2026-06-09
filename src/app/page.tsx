import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/home/Hero'
import { StatsBar } from '@/components/home/StatsBar'
import { FeaturedCourses } from '@/components/home/FeaturedCourses'
import { LearningPaths } from '@/components/home/LearningPaths'
import { Features } from '@/components/home/Features'
import { AIPromo } from '@/components/home/AIPromo'
import { ContinueLearningBanner } from '@/components/home/ContinueLearningBanner'
import { CallToAction } from '@/components/home/CallToAction'
import { getAllCourses } from '@/lib/content/loader'

export default function HomePage() {
    const courses = getAllCourses()

    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <StatsBar courses={courses} />
                <Suspense>
                    <ContinueLearningBanner />
                </Suspense>
                <FeaturedCourses courses={courses} />
                <LearningPaths />
                <Features />
                <AIPromo />
                <CallToAction />
            </main>
            <Footer />
        </>
    )
}