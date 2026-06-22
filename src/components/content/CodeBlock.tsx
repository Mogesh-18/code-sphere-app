'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Play, FileCode2, Terminal } from 'lucide-react'
import type { CodeBlockNode } from '@/types/content'
import { cn } from '@/lib/utils'

// Language display labels
const LANG_LABELS: Record<string, string> = {
    js: 'JavaScript', javascript: 'JavaScript',
    ts: 'TypeScript', typescript: 'TypeScript',
    jsx: 'JSX', tsx: 'TSX',
    html: 'HTML', css: 'CSS',
    php: 'PHP', sql: 'SQL',
    bash: 'Bash', sh: 'Shell', shell: 'Shell',
    json: 'JSON', yaml: 'YAML', yml: 'YAML',
    text: 'Text', plaintext: 'Text', txt: 'Text',
    ini: 'Config',
}

// Color dots for language icons
const LANG_COLORS: Record<string, string> = {
    javascript: '#F7DF1E', js: '#F7DF1E',
    typescript: '#3178C6', ts: '#3178C6',
    html: '#E34F26',
    css: '#264DE4',
    php: '#8892BE',
    sql: '#CC2927',
    bash: '#4EAA25', sh: '#4EAA25', shell: '#4EAA25',
    json: '#9ECBFF',
}

// Minimal tokenizer for common syntax patterns
// (No external dependencies — pure regex-based)
function tokenize(code: string, lang: string): string {
    const language = lang.toLowerCase()

    // Escape HTML entities first
    let escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    if (['text', 'plaintext', 'txt', 'output'].includes(language)) {
        return escaped
    }

    if (['bash', 'sh', 'shell'].includes(language)) {
        return escaped
            .replace(/(#[^\n]*)/g, '<span class="ct-comment">$1</span>')
            .replace(/\b(export|source|echo|cd|ls|npm|npx|composer|php|artisan|git|mkdir|cp|mv|rm)\b/g, '<span class="ct-kw">$1</span>')
            .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="ct-str">$1</span>')
            .replace(/(\$[A-Z_][A-Z0-9_]*)/gi, '<span class="ct-var">$1</span>')
    }

    if (language === 'sql') {
        return escaped
            .replace(/(--.*)$/gm, '<span class="ct-comment">$1</span>')
            .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|INSERT INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|ALTER|DROP|NULL|IS|NOT|AND|OR|IN|LIKE|BETWEEN|AS|DISTINCT|LIMIT|OFFSET|COUNT|SUM|AVG|MAX|MIN|EXPLAIN)\b/gi, '<span class="ct-kw">$1</span>')
            .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="ct-str">$1</span>')
            .replace(/\b(\d+)\b/g, '<span class="ct-num">$1</span>')
    }

    if (['html'].includes(language)) {
        return escaped
            .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="ct-comment">$1</span>')
            .replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9-]*)/g, '<span class="ct-tag">$1</span>')
            .replace(/(&gt;)/g, '<span class="ct-tag">$1</span>')
            .replace(/([a-zA-Z-]+)(=)/g, '<span class="ct-attr">$1</span>=')
            .replace(/(=)(&quot;[^&]*&quot;|&#39;[^&]*&#39;)/g, '=<span class="ct-str">$2</span>')
    }

    if (language === 'css') {
        return escaped
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="ct-comment">$1</span>')
            .replace(/([.#][a-zA-Z][a-zA-Z0-9_-]*)/g, '<span class="ct-selector">$1</span>')
            .replace(/([a-zA-Z-]+)(\s*:)/g, '<span class="ct-prop">$1</span>$2')
            .replace(/:\s*([^;{}]+)/g, (m, v) => ': <span class="ct-val">' + v + '</span>')
            .replace(/(--[a-zA-Z][a-zA-Z0-9-]*)/g, '<span class="ct-var">$1</span>')
            .replace(/#([0-9a-fA-F]{3,6})\b/g, '<span class="ct-str">#$1</span>')
    }

    // PHP / JS / TS — shared tokenizer
    const result = escaped
        // Comments
        .replace(/(\/\/[^\n]*|#[^\n]*(?!php))/g, '<span class="ct-comment">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="ct-comment">$1</span>')
        // Strings
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="ct-str">$1</span>')
        // PHP tags
        .replace(/(&lt;\?php|&lt;\?=|\?&gt;)/g, '<span class="ct-phptag">$1</span>')
        // Keywords
        .replace(/\b(function|return|if|else|elseif|for|foreach|while|do|switch|case|break|continue|class|new|extends|implements|interface|abstract|trait|use|namespace|public|private|protected|static|final|const|var|let|const|async|await|try|catch|finally|throw|import|export|default|from|typeof|instanceof|in|of|void|null|true|false|undefined|=>|declare|type|enum|interface|readonly)\b/g, '<span class="ct-kw">$1</span>')
        // Numbers
        .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="ct-num">$1</span>')
        // PHP variables
        .replace(/(\$[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="ct-var">$1</span>')
        // Function/method calls
        .replace(/([a-zA-Z_][a-zA-Z0-9_]*)(\s*\()/g, '<span class="ct-fn">$1</span>$2')

    return result
}

interface Props {
    node: CodeBlockNode
}

export function CodeBlock({ node }: Props) {
    const [copied, setCopied] = useState(false)
    const lang = node.language || 'text'
    const label = LANG_LABELS[lang.toLowerCase()] ?? lang.toUpperCase()
    const dotColor = LANG_COLORS[lang.toLowerCase()] ?? '#9494AA'

    const highlighted = tokenize(node.code, lang)

    async function handleCopy() {
        await navigator.clipboard.writeText(node.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
    }

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0D0D16] shadow-elevation-2 group">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#111118] border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                    {/* Traffic lights */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                        <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    </div>
                    <div className="w-px h-4 bg-white/[0.08]" />
                    {/* Language label */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
                        <span className="text-xs font-500 text-[var(--text-muted)]">{label}</span>
                    </div>
                    {/* Filename */}
                    {node.filename && (
                        <>
                            <div className="w-px h-4 bg-white/[0.08]" />
                            <div className="flex items-center gap-1.5">
                                <FileCode2 size={11} className="text-[var(--text-muted)]" />
                                <span className="text-xs text-[var(--text-muted)] font-mono">{node.filename}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-500 border transition-all',
                        'opacity-0 group-hover:opacity-100',
                        copied
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                            : 'bg-white/[0.04] text-[var(--text-muted)] border-white/[0.08] hover:text-white hover:border-white/[0.16]'
                    )}
                    aria-label="Copy code"
                >
                    {copied ? (
                        <><Check size={12} /> Copied</>
                    ) : (
                        <><Copy size={12} /> Copy</>
                    )}
                </button>
            </div>

            {/* Code */}
            <div className="relative overflow-x-auto">
                <pre className="p-5 text-sm font-mono leading-[1.75] text-[#CDD6F4]">
                    <code
                        className="block"
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                </pre>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────────
// Inject tokenizer CSS into global styles
// (scoped class names prevent conflicts)
// ──────────────────────────────────────────────────

export function CodeBlockStyles() {
    return (
        <style>{`
            .ct-kw      { color: #CBA6F7; font-style: italic; }
            .ct-str     { color: #A6E3A1; }
            .ct-num     { color: #FAB387; }
            .ct-comment { color: #585B70; font-style: italic; }
            .ct-fn      { color: #89B4FA; }
            .ct-var     { color: #F38BA8; }
            .ct-attr    { color: #F9E2AF; }
            .ct-tag     { color: #89DCEB; }
            .ct-selector{ color: #89B4FA; }
            .ct-prop    { color: #89DCEB; }
            .ct-val     { color: #A6E3A1; }
            .ct-phptag  { color: #CBA6F7; font-weight: bold; }
    `}</style>
    )
}