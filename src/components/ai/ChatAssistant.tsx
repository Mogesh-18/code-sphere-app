'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    Brain, Send, X, Trash2, RotateCcw, Loader2, AlertCircle,
    ChevronDown, Sparkles,
} from 'lucide-react'
import type { ChatMessage, AIContext } from '@/types/ai'
import { cn, generateUUID } from '@/lib/utils'

interface Props {
    context: AIContext
    onClose?: () => void
}

const STARTER_QUESTIONS = [
    'Explain this concept in simple terms',
    'What are the common mistakes beginners make here?',
    'Can you give me a practical example?',
    'How does this relate to what I learned before?',
]

export function AIChatAssistant({ context, onClose }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const abortRef = useRef<AbortController | null>(null)

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    async function sendMessage(text?: string) {
        const content = (text ?? input).trim()
        if (!content || isLoading) return

        setInput('')
        setError(null)

        const userMessage: ChatMessage = {
            id: generateUUID(),
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
        }

        const assistantMessage: ChatMessage = {
            id: generateUUID(),
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            isStreaming: true,
        }

        setMessages(prev => [...prev, userMessage, assistantMessage])
        setIsLoading(true)

        abortRef.current = new AbortController()

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    context,
                }),
                signal: abortRef.current.signal,
            })

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Request failed' }))
                throw new Error(err.error || `HTTP ${response.status}`)
            }

            const reader = response.body?.getReader()
            if (!reader) throw new Error('No response body')

            const decoder = new TextDecoder()
            let accumulated = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))
                            if (data.content) {
                                accumulated += data.content
                                setMessages(prev =>
                                    prev.map(m =>
                                        m.id === assistantMessage.id
                                            ? { ...m, content: accumulated, isStreaming: !data.done }
                                            : m
                                    )
                                )
                            }
                            if (data.done) break
                        } catch {
                            // Skip malformed chunks
                        }
                    }
                }
            }

        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMessage.id
                            ? { ...m, isStreaming: false }
                            : m
                    )
                )
                return
            }

            const errorMsg = err instanceof Error ? err.message : 'Something went wrong'
            setError(errorMsg)
            setMessages(prev => prev.filter(m => m.id !== assistantMessage.id))
        } finally {
            setIsLoading(false)
            setMessages(prev =>
                prev.map(m =>
                    m.id === assistantMessage.id
                        ? { ...m, isStreaming: false }
                        : m
                )
            )
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    function stopGeneration() {
        abortRef.current?.abort()
        setIsLoading(false)
    }

    function clearChat() {
        abortRef.current?.abort()
        setMessages([])
        setError(null)
        setIsLoading(false)
    }

    return (
        <div className="flex flex-col w-full h-full bg-[#0A0A12]">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07] bg-[#0F0F1A]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <Brain size={14} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-white">DevLearn AI</p>
                    {context.sectionTitle && (
                        <p className="text-xs text-cyan-400/70 truncate">
                            Context: {context.sectionTitle}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                        <button
                            onClick={clearChat}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white transition-colors"
                            title="Clear chat"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white transition-colors"
                            aria-label="Close AI chat"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {/* Welcome state */}
                {messages.length === 0 && (
                    <div className="space-y-4">
                        <div className="text-center py-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                                <Sparkles size={20} className="text-cyan-400" />
                            </div>
                            <h3 className="font-display font-600 text-white text-sm mb-1.5">
                                AI Tutor Ready
                            </h3>
                            <p className="text-xs text-[var(--text-muted)] max-w-[200px] mx-auto leading-relaxed">
                                Ask anything about{' '}
                                <span className="text-cyan-400">{context.sectionTitle ?? 'this lesson'}</span>.
                                I have full context of your current section.
                            </p>
                        </div>

                        {/* Starter questions */}
                        <div className="space-y-2">
                            <p className="text-xs text-[var(--text-muted)] px-1">Suggested questions:</p>
                            {STARTER_QUESTIONS.map(q => (
                                <button
                                    key={q}
                                    onClick={() => sendMessage(q)}
                                    className="w-full text-left text-xs px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[var(--text-secondary)] hover:border-cyan-500/30 hover:text-white transition-all"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message list */}
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-600 text-rose-400 mb-1">Error</p>
                            <p className="text-xs text-rose-400/80">{error}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1.5">
                                Make sure Ollama is running or configure an API key in .env
                            </p>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.07]">
                {isLoading && (
                    <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-2 text-xs text-cyan-400">
                            <Loader2 size={11} className="animate-spin" />
                            Generating...
                        </div>
                        <button
                            onClick={stopGeneration}
                            className="text-xs text-[var(--text-muted)] hover:text-white transition-colors"
                        >
                            Stop
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about this lesson..."
                        rows={1}
                        disabled={isLoading}
                        className={cn(
                            'flex-1 resize-none bg-[#111118] border border-white/[0.08] rounded-xl px-3 py-2.5',
                            'text-sm text-white placeholder:text-[var(--text-muted)]',
                            'focus:border-cyan-500/40 focus:outline-none transition-colors',
                            'max-h-32 overflow-y-auto leading-relaxed',
                            isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                        style={{ minHeight: '42px' }}
                        onInput={e => {
                            const el = e.target as HTMLTextAreaElement
                            el.style.height = 'auto'
                            el.style.height = Math.min(el.scrollHeight, 128) + 'px'
                        }}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            'p-2.5 rounded-xl border transition-all flex-shrink-0',
                            input.trim() && !isLoading
                                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30'
                                : 'bg-white/[0.04] border-white/[0.07] text-[var(--text-muted)] cursor-not-allowed'
                        )}
                        aria-label="Send message"
                    >
                        <Send size={15} />
                    </button>
                </div>

                <p className="text-2xs text-[var(--text-muted)] mt-2 text-center">
                    Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────────
// Message bubble
// ──────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user'

    return (
        <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            {!isUser && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Brain size={11} className="text-black" />
                </div>
            )}

            {/* Bubble */}
            <div
                className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    isUser
                        ? 'bg-amber-500/15 border border-amber-500/20 text-[var(--text-primary)] rounded-br-sm'
                        : 'bg-[#111118] border border-white/[0.07] text-[var(--text-secondary)] rounded-bl-sm'
                )}
            >
                <AIMessageContent content={message.content} isStreaming={message.isStreaming} />
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────────
// AI message content — renders markdown-like syntax
// ──────────────────────────────────────────────────

function AIMessageContent({
    content,
    isStreaming,
}: {
    content: string
    isStreaming?: boolean
}) {
    if (!content && isStreaming) {
        return (
            <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
        )
    }

    // Simple markdown rendering for AI responses
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g)

    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const lines = part.slice(3, -3).split('\n')
                    const lang = lines[0].trim() || 'text'
                    const code = lines.slice(1).join('\n')
                    return (
                        <pre
                            key={i}
                            className="my-2 p-3 bg-[#0D0D16] border border-white/[0.07] rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto"
                        >
                            {code}
                        </pre>
                    )
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <code
                            key={i}
                            className="px-1.5 py-0.5 bg-[#0D0D16] border border-white/[0.07] rounded text-xs font-mono text-amber-300"
                        >
                            {part.slice(1, -1)}
                        </code>
                    )
                }
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="text-white font-600">{part.slice(2, -2)}</strong>
                }
                // Regular text — preserve newlines
                return (
                    <span key={i}>
                        {part.split('\n').map((line, li) => (
                            <span key={li}>
                                {line}
                                {li < part.split('\n').length - 1 && <br />}
                            </span>
                        ))}
                    </span>
                )
            })}
            {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-pulse align-text-bottom" />
            )}
        </>
    )
}