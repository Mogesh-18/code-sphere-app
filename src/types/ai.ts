// ──────────────────────────────────────────────────
// AI Assistant Types
// Designed to be provider-agnostic so the underlying
// AI model can be swapped without UI changes.
// ──────────────────────────────────────────────────

export type AIProvider = 'openrouter' | 'ollama' | 'groq' | 'gemini'

export type MessageRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
    id: string
    role: MessageRole
    content: string
    timestamp: string
    isStreaming?: boolean
    error?: string
}

export interface AIContext {
    courseSlug?: string
    courseTitle?: string
    chapterTitle?: string
    sectionTitle?: string
    currentContent?: string  // The section content for context
}

export interface ChatSession {
    id: string
    messages: ChatMessage[]
    context: AIContext
    createdAt: string
    updatedAt: string
}

export interface AIConfig {
    provider: AIProvider
    model: string
    temperature: number
    maxTokens: number
    systemPrompt: string
}

export interface StreamChunk {
    content: string
    done: boolean
    error?: string
}

// Provider capability map
export const AI_PROVIDERS: Record<AIProvider, {
    name: string
    models: string[]
    baseUrl: string
    requiresKey: boolean
    isFree: boolean
    setupInstructions: string
}> = {
    ollama: {
        name: 'Ollama (Local)',
        models: ['mistral', 'llama3', 'codellama', 'phi3', 'gemma2'],
        baseUrl: 'http://localhost:11434',
        requiresKey: false,
        isFree: true,
        setupInstructions: 'Install Ollama from ollama.ai, then run: ollama pull mistral',
    },
    openrouter: {
        name: 'OpenRouter',
        models: [
            'mistralai/mistral-7b-instruct:free',
            'meta-llama/llama-3-8b-instruct:free',
            'google/gemma-7b-it:free',
        ],
        baseUrl: 'https://openrouter.ai/api/v1',
        requiresKey: true,
        isFree: true,
        setupInstructions: 'Get a free API key at openrouter.ai',
    },
    groq: {
        name: 'Groq',
        models: ['llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
        baseUrl: 'https://api.groq.com/openai/v1',
        requiresKey: true,
        isFree: true,
        setupInstructions: 'Get a free API key at console.groq.com',
    },
    gemini: {
        name: 'Google Gemini',
        models: ['gemini-1.5-flash-latest'],
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        requiresKey: true,
        isFree: true,
        setupInstructions: 'Get a free API key at aistudio.google.com',
    },
}