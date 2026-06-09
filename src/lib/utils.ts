import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatReadingTime(minutes: number): string {
    if (minutes < 1) return 'Less than 1 min'
    if (minutes === 1) return '1 min read'
    return `${minutes} min read`
}

export function formatTimeSpent(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function formatRelativeTime(dateString: string): string {
    try {
        return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
    } catch {
        return 'recently'
    }
}

export function difficultyLabel(difficulty: string): string {
    const map: Record<string, string> = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
    }
    return map[difficulty] || difficulty
}

export function difficultyColor(difficulty: string): string {
    const map: Record<string, string> = {
        beginner: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        intermediate: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        advanced: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    }
    return map[difficulty] || 'text-gray-400 bg-gray-400/10'
}

export function categoryLabel(category: string): string {
    const map: Record<string, string> = {
        frontend: 'Frontend',
        backend: 'Backend',
        fullstack: 'Full Stack',
        framework: 'Framework',
        language: 'Language',
        tools: 'Tools',
    }
    return map[category] || category
}

export function generateUUID(): string {
    return crypto.randomUUID()
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

export function percentage(value: number, total: number): number {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key])
        return {
            ...groups,
            [groupKey]: [...(groups[groupKey] || []), item],
        }
    }, {} as Record<string, T[]>)
}

export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

// Strip content nodes to plain text for AI context
export function contentNodesToText(nodes: any[]): string {
    if (!nodes?.length) return ''

    const parts: string[] = []

    for (const node of nodes) {
        switch (node.type) {
            case 'heading':
                parts.push(`${'#'.repeat(node.level)} ${node.text}`)
                break
            case 'paragraph':
                if (node.children) {
                    const text = node.children
                        .map((c: any) => {
                            if (c.type === 'text') return c.value
                            if (c.type === 'strong') return contentNodesToText(c.children)
                            if (c.type === 'code') return `\`${c.value}\``
                            return ''
                        })
                        .join('')
                    parts.push(text)
                }
                break
            case 'code':
                parts.push(`\`\`\`${node.language}\n${node.code}\n\`\`\``)
                break
        }
    }

    return parts.slice(0, 30).join('\n\n').slice(0, 3000)
}