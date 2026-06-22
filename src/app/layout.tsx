import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from './providers'

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
        siteName: 'DevLearn',
        title: 'DevLearn — Professional Developer Learning Platform',
        description: 'Master modern web development with professional guides.',
    },
    robots: { index: true, follow: true },
}

export const viewport = {
    themeColor: '#F59E0B',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-surface-950 text-[var(--text-primary)] font-body antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}