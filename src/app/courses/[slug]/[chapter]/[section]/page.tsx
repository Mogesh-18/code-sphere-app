import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
    getCourse, getSection, getSectionNavigation, getAllSectionParams,
} from '@/lib/content/loader'
import { SectionLayout } from '@/components/content/SectionLayout'

interface Props {
    params: { slug: string; chapter: string; section: string }
}

export async function generateStaticParams() {
    return getAllSectionParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const section = getSection(params.slug, params.chapter, params.section)
    if (!section) return {}
    return {
        title: section.title,
        description: `Learn ${section.title} in the ${params.slug.toUpperCase()} professional guide.`,
    }
}

export default function SectionPage({ params }: Props) {
    const course = getCourse(params.slug)
    if (!course) notFound()

    const chapter = course.chapters.find(c => c.slug === params.chapter)
    if (!chapter) notFound()

    const section = chapter.sections.find(s => s.slug === params.section)
    if (!section) notFound()

    const nav = getSectionNavigation(params.slug, params.chapter, params.section)

    return (
        <SectionLayout
            course={course}
            chapter={chapter}
            section={section}
            nav={nav}
        />
    )
}