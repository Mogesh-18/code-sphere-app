import React from 'react'
import type {
    ContentNode, InlineNode, HeadingNode, ParagraphNode, CodeBlockNode,
    ListNode, TableNode, BlockquoteNode, CalloutNode,
} from '@/types/content'
import { CodeBlock } from '@/components/content/CodeBlock'
import { cn } from '@/lib/utils'
import { AlertCircle, Info, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'

// ──────────────────────────────────────────────────
// Inline renderer
// ──────────────────────────────────────────────────

function renderInline(nodes: InlineNode[], key?: string): React.ReactNode {
    return nodes.map((node, i) => {
        const k = `${key ?? ''}-${i}`
        switch (node.type) {
            case 'text':
                return <React.Fragment key={k}>{node.value}</React.Fragment>

            case 'strong':
                return <strong key={k}>{renderInline(node.children, k)}</strong>

            case 'emphasis':
                return <em key={k}>{renderInline(node.children, k)}</em>

            case 'code':
                return (
                    <code
                        key={k}
                        className="font-mono text-[0.875em] bg-[var(--surface-600)] text-amber-300 px-[0.4em] py-[0.15em] rounded border border-white/[0.08]"
                    >
                        {node.value}
                    </code>
                )

            case 'link':
                return (
                    <a
                        key={k}
                        href={node.href}
                        target={node.href.startsWith('http') ? '_blank' : undefined}
                        rel={node.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-cyan-400 underline underline-offset-2 decoration-cyan-400/40 hover:decoration-cyan-400 transition-all"
                    >
                        {renderInline(node.children, k)}
                    </a>
                )

            case 'linebreak':
                return <br key={k} />

            default:
                return null
        }
    })
}

// ──────────────────────────────────────────────────
// Node renderers
// ──────────────────────────────────────────────────

function HeadingRenderer({ node }: { node: HeadingNode }) {
    const Tag = `h${node.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    const classes: Record<number, string> = {
        1: 'font-display text-3xl font-700 text-white mt-10 mb-5',
        2: 'font-display text-2xl font-700 text-white mt-10 mb-4 pt-5 border-t border-white/[0.07]',
        3: 'font-display text-xl font-600 text-white mt-8 mb-3',
        4: 'font-display text-base font-600 text-[var(--text-secondary)] uppercase tracking-wide mt-6 mb-2',
        5: 'font-display text-sm font-600 text-[var(--text-muted)] mt-4 mb-2',
        6: 'text-sm font-600 text-[var(--text-muted)] mt-3 mb-1',
    }
    return (
        <Tag id={node.id} className={cn(classes[node.level], 'scroll-mt-20')}>
            {node.text}
        </Tag>
    )
}

function ParagraphRenderer({ node }: { node: ParagraphNode }) {
    return (
        <p className="text-[#CCCCDD] leading-[1.8] mb-5 text-[0.9375rem]">
            {renderInline(node.children)}
        </p>
    )
}

function ListRenderer({ node }: { node: ListNode }) {
    const Tag = node.ordered ? 'ol' : 'ul'
    return (
        <Tag
            className={cn(
                'mb-5 pl-6 space-y-2 text-[0.9375rem]',
                node.ordered ? 'list-decimal' : 'list-none'
            )}
        >
            {node.items.map((item, i) => (
                <li key={i} className="text-[#CCCCDD] leading-relaxed relative">
                    {!node.ordered && (
                        <span className="absolute -left-4 top-[0.4em] w-1.5 h-1.5 rounded-full bg-amber-500/70" />
                    )}
                    {item.children.map((child, j) => (
                        <NodeRenderer key={j} node={child} />
                    ))}
                </li>
            ))}
        </Tag>
    )
}

function TableRenderer({ node }: { node: TableNode }) {
    return (
        <div className="overflow-x-auto my-6 rounded-xl border border-white/[0.08]">
            <table className="content-table min-w-full">
                <thead>
                    <tr>
                        {node.headers.map((h, i) => (
                            <th
                                key={i}
                                className="bg-[var(--surface-600)] px-4 py-3 text-left text-xs font-600 uppercase tracking-widest text-[var(--text-secondary)] border-b border-white/[0.1]"
                                style={{ textAlign: node.align?.[i] ?? 'left' }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {node.rows.map((row, ri) => (
                        <tr
                            key={ri}
                            className={ri % 2 === 0 ? 'bg-[var(--surface-800)]' : 'bg-[var(--surface-900)]'}
                        >
                            {row.map((cell, ci) => (
                                <td
                                    key={ci}
                                    className="px-4 py-3 text-sm text-[#CCCCDD] border-b border-white/[0.04] align-top"
                                    style={{ textAlign: node.align?.[ci] ?? 'left' }}
                                    dangerouslySetInnerHTML={{
                                        // Safe: cell content is server-generated from trusted markdown files
                                        __html: cell
                                            .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-[#1A1A28] text-amber-300 px-1.5 py-0.5 rounded border border-white/5">$1</code>')
                                            .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-600">$1</strong>'),
                                    }}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function BlockquoteRenderer({ node }: { node: BlockquoteNode }) {
    return (
        <blockquote className="my-6 pl-5 border-l-2 border-amber-500/50 bg-amber-500/[0.04] rounded-r-xl py-4 pr-4">
            <div className="text-[var(--text-secondary)] italic">
                {node.children.map((child, i) => (
                    <NodeRenderer key={i} node={child} />
                ))}
            </div>
        </blockquote>
    )
}

const CALLOUT_STYLES = {
    note: { icon: Info, bg: 'bg-blue-500/8', border: 'border-blue-500/25', text: 'text-blue-400', title: 'Note' },
    info: { icon: Info, bg: 'bg-cyan-500/8', border: 'border-cyan-500/25', text: 'text-cyan-400', title: 'Info' },
    tip: { icon: Lightbulb, bg: 'bg-emerald-500/8', border: 'border-emerald-500/25', text: 'text-emerald-400', title: 'Tip' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-500/8', border: 'border-amber-500/25', text: 'text-amber-400', title: 'Warning' },
    danger: { icon: AlertCircle, bg: 'bg-rose-500/8', border: 'border-rose-500/25', text: 'text-rose-400', title: 'Danger' },
}

function CalloutRenderer({ node }: { node: CalloutNode }) {
    const style = CALLOUT_STYLES[node.variant] ?? CALLOUT_STYLES.note
    const Icon = style.icon
    return (
        <div className={cn('my-6 rounded-xl border p-5', style.bg, style.border)}>
            <div className={cn('flex items-center gap-2 font-600 text-sm mb-3', style.text)}>
                <Icon size={15} />
                {node.title ?? style.title}
            </div>
            <div className="text-[var(--text-secondary)] text-sm leading-relaxed [&>p]:mb-0 [&>p]:text-[0.875rem]">
                {node.children.map((child, i) => (
                    <NodeRenderer key={i} node={child} />
                ))}
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────────
// Single node dispatcher
// ──────────────────────────────────────────────────

function NodeRenderer({ node }: { node: ContentNode }) {
    switch (node.type) {
        case 'heading':
            return <HeadingRenderer node={node} />
        case 'paragraph':
            return <ParagraphRenderer node={node} />
        case 'code':
            return <CodeBlock node={node} />
        case 'list':
            return <ListRenderer node={node} />
        case 'table':
            return <TableRenderer node={node} />
        case 'blockquote':
            return <BlockquoteRenderer node={node} />
        case 'callout':
            return <CalloutRenderer node={node} />
        case 'divider':
            return <hr className="my-8 border-white/[0.08]" />
        default:
            return null
    }
}

// ──────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────

interface ContentRendererProps {
    nodes: ContentNode[]
    className?: string
}

export function ContentRenderer({ nodes, className }: ContentRendererProps) {
    return (
        <div className={cn('content-body max-w-3xl', className)}>
            {nodes.map((node, i) => (
                <NodeRenderer key={i} node={node} />
            ))}
        </div>
    )
}