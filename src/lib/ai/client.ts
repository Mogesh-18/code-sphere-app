/**
 * AI Client
 *
 * Provider-agnostic streaming AI chat client.
 * Supports Ollama (local/free), OpenRouter (free models), and Groq (free tier).
 */

import type { AIProvider, ChatMessage, AIContext, StreamChunk } from '@/types/ai'

const SYSTEM_PROMPT_TEMPLATE = `You are DevLearn AI, an expert programming tutor embedded in a developer learning platform.

Your role:
- Help learners understand programming concepts clearly and concisely
- Explain code snippets from the current lesson
- Clarify doubts with practical examples
- Suggest what to learn next based on the current topic
- Be encouraging and supportive

Current learning context:
{context}

Guidelines:
- Keep responses focused and educational
- Use code examples when helpful (in markdown code blocks)
- Reference the current lesson content when relevant
- Don't write entire applications — guide understanding
- Be conversational but precise
- If you don't know something, say so honestly`

function buildSystemPrompt(context: AIContext): string {
    const contextLines: string[] = []

    if (context.courseTitle) contextLines.push(`Course: ${context.courseTitle}`)
    if (context.chapterTitle) contextLines.push(`Chapter: ${context.chapterTitle}`)
    if (context.sectionTitle) contextLines.push(`Section: ${context.sectionTitle}`)
    if (context.currentContent) {
        // Truncate to avoid overwhelming the context window
        const truncated = context.currentContent.slice(0, 2000)
        contextLines.push(`\nCurrent lesson content (excerpt):\n${truncated}`)
    }

    const contextStr = contextLines.length > 0
        ? contextLines.join('\n')
        : 'No specific lesson context available.'

    return SYSTEM_PROMPT_TEMPLATE.replace('{context}', contextStr)
}

// ──────────────────────────────────────────────────
// Ollama provider (local, completely free)
// ──────────────────────────────────────────────────

async function* streamOllama(
    messages: ChatMessage[],
    context: AIContext,
    model: string,
    baseUrl: string
): AsyncGenerator<StreamChunk> {
    const systemPrompt = buildSystemPrompt(context)

    const payload = {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        stream: true,
    }

    const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(l => l.trim())

        for (const line of lines) {
            try {
                const json = JSON.parse(line)
                if (json.message?.content) {
                    yield { content: json.message.content, done: false }
                }
                if (json.done) {
                    yield { content: '', done: true }
                }
            } catch {
                // Skip malformed JSON chunks
            }
        }
    }
}

// ──────────────────────────────────────────────────
// OpenAI-compatible provider (OpenRouter, Groq, Gemini)
// ──────────────────────────────────────────────────

async function* streamOpenAICompatible(
    messages: ChatMessage[],
    context: AIContext,
    model: string,
    baseUrl: string,
    apiKey: string,
    extraHeaders: Record<string, string> = {}
): AsyncGenerator<StreamChunk> {
    const systemPrompt = buildSystemPrompt(context)

    const payload = {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...extraHeaders,
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`API error ${response.status}: ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed === 'data: [DONE]') {
                if (trimmed === 'data: [DONE]') yield { content: '', done: true }
                continue
            }

            if (trimmed.startsWith('data: ')) {
                try {
                    const json = JSON.parse(trimmed.slice(6))
                    const delta = json.choices?.[0]?.delta?.content
                    if (delta) yield { content: delta, done: false }
                } catch {
                    // Skip malformed SSE
                }
            }
        }
    }

    yield { content: '', done: true }
}

// ──────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────

export async function* streamAIResponse(
    messages: ChatMessage[],
    context: AIContext
): AsyncGenerator<StreamChunk> {
    const provider = (process.env.NEXT_PUBLIC_AI_PROVIDER || 'ollama') as AIProvider

    try {
        switch (provider) {
            case 'ollama': {
                const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
                const model = process.env.OLLAMA_MODEL || 'mistral'
                yield* streamOllama(messages, context, model, baseUrl)
                break
            }

            case 'openrouter': {
                const apiKey = process.env.OPENROUTER_API_KEY || ''
                const model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free'
                yield* streamOpenAICompatible(
                    messages, context, model,
                    'https://openrouter.ai/api/v1',
                    apiKey,
                    {
                        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                        'X-Title': 'DevLearn Platform',
                    }
                )
                break
            }

            case 'groq': {
                const apiKey = process.env.GROQ_API_KEY || ''
                const model = process.env.GROQ_MODEL || 'llama3-8b-8192'
                yield* streamOpenAICompatible(
                    messages, context, model,
                    'https://api.groq.com/openai/v1',
                    apiKey
                )
                break
            }

            default:
                throw new Error(`Unknown AI provider: ${provider}`)
        }
    } catch (error) {
        yield {
            content: '',
            done: true,
            error: error instanceof Error ? error.message : 'AI request failed',
        }
    }
}

export function extractTextFromContent(content: any[]): string {
    if (!Array.isArray(content)) return ''

    const parts: string[] = []

    for (const node of content) {
        if (!node) continue
        if (node.type === 'paragraph' && node.children) {
            const text = node.children
                .filter((c: any) => c.type === 'text')
                .map((c: any) => c.value)
                .join('')
            if (text) parts.push(text)
        }
        if (node.type === 'heading') {
            parts.push(node.text)
        }
    }

    return parts.slice(0, 20).join('\n\n')
}
