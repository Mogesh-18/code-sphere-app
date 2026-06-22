import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { TryItEditor } from '@/components/playground/TryItEditor'

export const metadata: Metadata = {
    title: 'Playground',
    description: 'Interactive code playground. Write and run HTML, CSS, JavaScript, jQuery, and PHP in your browser.',
}

export default function PlaygroundPage() {
    return (
        <>
            <Navbar />
            <main className="h-screen flex flex-col pt-[var(--nav-height)] bg-[#07070D]">
                <TryItEditor />
            </main>
        </>
    )
}