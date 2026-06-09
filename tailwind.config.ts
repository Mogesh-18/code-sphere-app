import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Design token system
                brand: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },
                accent: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63',
                },
                surface: {
                    950: '#07070D',
                    900: '#0A0A12',
                    800: '#0F0F1A',
                    700: '#141420',
                    600: '#1A1A28',
                    500: '#202033',
                    400: '#2A2A42',
                    300: '#383858',
                },
                muted: {
                    DEFAULT: '#64647A',
                    foreground: '#9494AA',
                }
            },
            fontFamily: {
                display: ['var(--font-syne)', 'sans-serif'],
                body: ['var(--font-ibm-plex-sans)', 'sans-serif'],
                mono: ['var(--font-ibm-plex-mono)', 'monospace'],
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '1rem' }],
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
            },
            animation: {
                'fade-up': 'fadeUp 0.5s ease-out forwards',
                'fade-in': 'fadeIn 0.4s ease-out forwards',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(16px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(245, 158, 11, 0.6)' },
                },
            },
            boxShadow: {
                'brand': '0 0 0 1px rgba(245, 158, 11, 0.2), 0 4px 24px rgba(245, 158, 11, 0.15)',
                'brand-lg': '0 0 0 1px rgba(245, 158, 11, 0.3), 0 8px 40px rgba(245, 158, 11, 0.25)',
                'accent': '0 0 0 1px rgba(6, 182, 212, 0.2), 0 4px 24px rgba(6, 182, 212, 0.15)',
                'inner-brand': 'inset 0 0 20px rgba(245, 158, 11, 0.1)',
                'elevation-1': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
                'elevation-2': '0 4px 16px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
                'elevation-3': '0 8px 32px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)',
                'elevation-4': '0 16px 64px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.4)',
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                    },
                },
            },
        },
    },
    plugins: [],
}

export default config