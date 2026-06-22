import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import { getCourseMetadata } from '@/lib/content/loader'
import { generateQuizForCourse } from '@/lib/quiz/generator'

interface Props {
    params: { courseId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const course = getCourseMetadata(params.courseId)
    return {
        title: course ? `${course.title} Quiz` : 'Quiz',
        description: 'Test your knowledge with this chapter quiz.',
    }
}

export default function QuizPage({ params }: Props) {
    const course = getCourseMetadata(params.courseId)
    if (!course) notFound()

    const quiz = generateQuizForCourse(params.courseId)

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-[var(--nav-height)] bg-[#07070D]">
                <div className="container-main py-12 max-w-3xl">
                    <QuizEngine quiz={quiz} courseTitle={course.title} courseSlug={params.courseId} />
                </div>
            </main>
        </>
    )
}