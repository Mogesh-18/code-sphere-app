import { type NextRequest, NextResponse } from 'next/server'
import type { ChatMessage, AIContext } from '@/types/ai'

// Edge runtime for lower latency streaming
export const runtime = 'edge'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as {
            messages: ChatMessage[]
            context: AIContext
        }

        const { messages, context } = body

        if (!messages?.length) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
        }

        // Build system prompt with context
        const systemPrompt = buildSystemPrompt(context)

        // Create streaming response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder()

                function send(data: object) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n`))
                }

                try {
                    const provider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'ollama'
                    await streamProvider(provider, messages, systemPrompt, send)
                    send({ content: '', done: true })
                } catch (err) {
                    send({
                        content: '',
                        done: true,
                        error: err instanceof Error ? err.message : 'AI request failed',
                    })
                } finally {
                    controller.close()
                }
            },
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })

    } catch (err) {
        console.error('AI chat error:', err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal error' },
            { status: 500 }
        )
    }
}

// ──────────────────────────────────────────────────
// System prompt builder
// ──────────────────────────────────────────────────

function buildSystemPrompt(context: AIContext): string {
    const ctxLines: string[] = []
    if (context.courseTitle) ctxLines.push(`Course: ${context.courseTitle}`)
    if (context.chapterTitle) ctxLines.push(`Chapter: ${context.chapterTitle}`)
    if (context.sectionTitle) ctxLines.push(`Section: ${context.sectionTitle}`)
    if (context.currentContent) {
        ctxLines.push(`\nLesson content (excerpt):\n${context.currentContent.slice(0, 2000)}`)
    }

    return `You are DevLearn AI, an expert programming tutor embedded in a developer learning platform.

Current lesson context:
${ctxLines.join('\n') || 'No specific context available.'}

Your role:
- Help learners understand the current lesson topic
- Explain code examples clearly
- Answer questions with practical examples
- Be concise but thorough
- Use markdown code blocks for code
- Be encouraging and supportive

Keep responses focused on the topic. If asked about unrelated subjects, gently redirect to the learning material.`
}

// ──────────────────────────────────────────────────
// Provider streaming implementations
// ──────────────────────────────────────────────────

async function streamProvider(
    provider: string,
    messages: ChatMessage[],
    systemPrompt: string,
    send: (data: object) => void
) {
    const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    switch (provider) {
        case 'ollama':
            await streamOllama(apiMessages, send)
            break
        case 'openrouter':
            await streamOpenAI(
                'https://openrouter.ai/api/v1/chat/completions',
                process.env.OPENROUTER_API_KEY || '',
                process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free',
                apiMessages,
                send,
                {
                    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                    'X-Title': 'DevLearn Platform',
                }
            )
            break
        case 'groq':
            await streamOpenAI(
                'https://api.groq.com/openai/v1/chat/completions',
                process.env.GROQ_API_KEY || '',
                process.env.GROQ_MODEL || 'llama3-8b-8192',
                apiMessages,
                send
            )
            break
        case 'gemini':
            await streamGemini(apiMessages, send)
            break
        default:
            throw new Error(`Unknown AI provider: ${provider}. Check NEXT_PUBLIC_AI_PROVIDER in .env`)
    }
}

async function streamOllama(
    messages: Array<{ role: string; content: string }>,
    send: (data: object) => void
) {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    const model = process.env.OLLAMA_MODEL || 'mistral'

    const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: true }),
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Ollama model '${model}' not found. Run: ollama pull ${model}`)
        }
        throw new Error(`Ollama error: ${response.status}. Is Ollama running at ${baseUrl}?`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        for (const line of text.split('\n').filter(Boolean)) {
            try {
                const json = JSON.parse(line)
                if (json.message?.content) send({ content: json.message.content, done: false })
            } catch { /* skip */ }
        }
    }
}

async function streamOpenAI(
    url: string,
    apiKey: string,
    model: string,
    messages: Array<{ role: string; content: string }>,
    send: (data: object) => void,
    extraHeaders: Record<string, string> = {}
) {
    if (!apiKey) {
        throw new Error(`API key missing. Set the appropriate API key in .env`)
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...extraHeaders,
        },
        body: JSON.stringify({
            model,
            messages,
            stream: true,
            max_tokens: 1024,
            temperature: 0.7,
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`API error ${response.status}: ${err}`)
    }

    const reader = response.body!.getReader()
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
            if (!trimmed || trimmed === 'data: [DONE]') continue
            if (trimmed.startsWith('data: ')) {
                try {
                    const json = JSON.parse(trimmed.slice(6))
                    const delta = json.choices?.[0]?.delta?.content
                    if (delta) send({ content: delta, done: false })
                } catch { /* skip */ }
            }
        }
    }
}

async function streamGemini(
    messages: Array<{ role: string; content: string }>,
    send: (data: object) => void
) {
    const apiKey = process.env.GEMINI_API_KEY || ''
    if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env')

    // Gemini uses different message format
    const systemMsg = messages.find(m => m.role === 'system')
    const chatMessages = messages.filter(m => m.role !== 'system')

    const contents = chatMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
    }))

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
                generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
            }),
        }
    )

    if (!response.ok) {
        throw new Error(`Gemini error: ${response.status}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // Gemini streams JSON array chunks
        try {
            const cleaned = buffer.trim().replace(/^,/, '').replace(/^\[/, '').replace(/\]$/, '')
            const json = JSON.parse(cleaned)
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
                send({ content: text, done: false })
                buffer = ''
            }
        } catch { /* accumulate more */ }
    }
}
