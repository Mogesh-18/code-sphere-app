import type { Metadata } from 'next'
import { Syne, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from './providers'

const syne = Syne({
    subsets: ['latin'],
    variable: '--font-syne',
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
    subsets: ['latin'],
    variable: '--font-ibm-plex-sans',
    weight: ['300', '400', '500', '600'],
    style: ['normal', 'italic'],
    display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
    subsets: ['latin'],
    variable: '--font-ibm-plex-mono',
    weight: ['400', '500'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: {
        default: 'DevLearn — Professional Developer Learning Platform',
        template: '%s | DevLearn',
    },
    description:
        'Master modern web development with professional guides covering HTML, CSS, JavaScript, jQuery, PHP, and Laravel.',
    keywords: ['web development', 'programming', 'javascript', 'php', 'laravel', 'css', 'html'],
    authors: [{ name: 'DevLearn' }],
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://devlearn.dev',
        siteName: 'DevLearn',
        title: 'DevLearn — Professional Developer Learning Platform',
        description: 'Master modern web development with professional guides.',
    },
    robots: { index: true, follow: true },
    themeColor: '#F59E0B',
    viewport: { width: 'device-width', initialScale: 1, maximumScale: 5 },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            className={`${syne.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
            suppressHydrationWarning
        >
            <body className="bg-surface-950 text-[var(--text-primary)] font-body antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}