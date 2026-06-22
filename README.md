# DevLearn — Enterprise Developer Learning Platform

A modern, premium developer learning platform built with Next.js 14, TypeScript, and Tailwind CSS. Designed for professional developer training with a focus on real engineering standards.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📚 **6 Complete Courses** | HTML, CSS, JavaScript, jQuery, PHP, Laravel |
| 🤖 **AI Tutor** | Context-aware AI that understands your current lesson |
| 🎮 **Interactive Playground** | Live HTML/CSS/JS/jQuery/PHP editor |
| 📊 **Progress Tracking** | Automatic completion, streaks, time tracking |
| 🏆 **Quiz System** | Chapter knowledge checks with explanations |
| 🌙 **Dark Theme** | Premium dark-first design |
| ⚡ **Zero Runtime MD** | Markdown pre-processed at build time to JSON |
| 📱 **Fully Responsive** | Works on all screen sizes |

## 🏗 Architecture

### Content Pipeline (Key Innovation)

```
Markdown Files (.md)
       ↓
process-content.ts (npm run content:build)
       ↓
Structured JSON (public/content/)
       ↓
Next.js Server Components (reads JSON)
       ↓
ContentRenderer (renders nodes, never parses MD)
```

**Why this matters:** Zero markdown parsing at runtime. The frontend renders typed JSON nodes through a custom `ContentRenderer` — no `react-markdown`, `remark-react`, or similar packages at runtime. This gives full control over styling, performance, and security.

### Key Directories

```
src/
├── app/                    # Next.js App Router pages
│   ├── courses/[slug]/     # Course detail
│   │   └── [chapter]/[section]/  # Section reader
│   ├── dashboard/          # Learner dashboard
│   ├── playground/         # Try-It editor
│   ├── quiz/[courseId]/    # Quiz system
│   └── api/ai/chat/        # AI streaming endpoint
├── components/
│   ├── content/            # ContentRenderer, CodeBlock, SectionLayout
│   ├── ai/                 # ChatAssistant (streaming)
│   ├── playground/         # TryItEditor (Monaco)
│   ├── quiz/               # QuizEngine
│   ├── dashboard/          # DashboardClient
│   └── home/               # Hero, FeaturedCourses, LearningPaths…
├── lib/
│   ├── content/loader.ts   # Reads processed JSON
│   ├── progress/store.ts   # Zustand progress store
│   ├── quiz/generator.ts   # Quiz question banks
│   └── ai/client.ts        # Multi-provider AI client
├── types/                  # TypeScript interfaces
└── hooks/                  # useProgress, useLearningStats

scripts/
└── process-content.ts      # Build-time MD → JSON pipeline

content/guides/             # Your markdown files go here
public/content/             # Generated JSON (git-ignored)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` to configure your AI provider (see AI Setup below).

### 3. Add Your Markdown Guides

Place your `.md` files in `content/guides/`. The filename must match the `filename` field in `scripts/process-content.ts`.

To add a new course, add an entry to the `GUIDE_CONFIGS` array in `scripts/process-content.ts`:

```typescript
{
  slug: 'react',
  filename: 'react-guide.md',
  title: 'React Professional',
  tagline: 'Modern React 18 with hooks, state management, and performance',
  category: 'framework',
  difficulty: 'intermediate',
  tags: ['react', 'jsx', 'hooks', 'state'],
  icon: '⚛️',
  color: '#61DAFB',
  gradient: 'from-cyan-400 to-blue-500',
  prerequisites: ['javascript'],
  relatedCourses: ['javascript'],
  author: 'Internal',
  version: '1.0.0',
},
```

That's it. No other code changes needed.

### 4. Run Development Server

```bash
npm run dev
```

The content pipeline runs automatically before `dev` and `build`.

### 5. Production Build

```bash
npm run build
npm start
```

## 🤖 AI Assistant Setup

The AI assistant supports multiple free providers. Configure in `.env.local`:

### Option 1: Ollama (Recommended — Completely Free, Local)

```bash
# Install Ollama from https://ollama.ai
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull mistral      # 4.1GB — recommended
ollama pull phi3         # 2.3GB — smaller, faster
ollama pull codellama    # 3.8GB — code-focused
```

```env
NEXT_PUBLIC_AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

### Option 2: OpenRouter (Free Models Available)

```env
NEXT_PUBLIC_AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

Get a free key at [openrouter.ai](https://openrouter.ai)

### Option 3: Groq (Fast, Free Tier)

```env
NEXT_PUBLIC_AI_PROVIDER=groq
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama3-8b-8192
```

Get a free key at [console.groq.com](https://console.groq.com)

### Option 4: Google Gemini (Free Tier)

```env
NEXT_PUBLIC_AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
```

Get a free key at [aistudio.google.com](https://aistudio.google.com)

## 📝 Content Format

### Markdown Structure

The pipeline converts H2 headings to chapters and H3 headings to sections:

```markdown
# Course Title

## Chapter 1: Introduction          ← becomes a chapter
### What This Is                     ← becomes a section
Content here...

### Why It Matters                   ← another section
More content...

## Chapter 2: Core Concepts          ← next chapter
### Variables                        ← section
```javascript
const x = 1;
```
```

### Supported Elements

| Element | Rendered As |
|---------|-------------|
| `**bold**` | `<strong>` |
| `` `code` `` | Inline code with amber highlight |
| ```` ```lang ```` | Syntax-highlighted code block |
| `| table |` | Styled data table |
| `> blockquote` | Indented quote with amber border |
| `- list item` | List with amber bullet |
| `1. ordered` | Numbered list |

## 🎨 Design System

The platform uses CSS custom properties for a consistent design:

```css
/* Primary accent */
--brand-400: #FBBF24;
--brand-500: #F59E0B;

/* Secondary accent */
--accent-400: #22D3EE;
--accent-500: #06B6D4;

/* Surface layers */
--surface-950: #07070D;  /* Deepest background */
--surface-800: #0F0F1A;  /* Cards */
--surface-600: #1A1A28;  /* Raised elements */

/* Typography */
--font-display: 'Syne'          /* Headings */
--font-body: 'IBM Plex Sans'    /* Body text */
--font-mono: 'IBM Plex Mono'    /* Code */
```

## 🔧 Extending the Platform

### Adding a New Language to Playground

In `src/components/playground/TryItEditor.tsx`, add to `LANGUAGES`:

```typescript
rust: {
  label: 'Rust',
  monacoLang: 'rust',
  icon: '🦀',
  renderMode: 'demo',
  defaultCode: `fn main() {\n    println!("Hello, Rust!");\n}`,
},
```

### Adding Quiz Questions

In `src/lib/quiz/generator.ts`, add to `QUESTION_BANKS`:

```typescript
react: [
  {
    id: 'react-1',
    type: 'single-choice',
    question: 'Which hook runs after every render?',
    options: [
      { id: 'a', text: 'useEffect', isCorrect: true },
      { id: 'b', text: 'useMemo', isCorrect: false },
    ],
    explanation: 'useEffect runs after every render by default.',
    difficulty: 'easy',
    tags: ['react', 'hooks'],
    points: 1,
  }
]
```

## 📈 Progress Tracking

Progress is stored locally in `localStorage` via Zustand persist. No backend required.

Tracked automatically:
- Sections completed (with timestamp)
- Time spent per section
- Course completion percentage
- Learning streaks (daily activity)
- Quiz attempts and scores

## 🛡 Security

- **XSS**: Content renderer never uses `dangerouslySetInnerHTML` on user input. Table cells use safe regex transforms on server-generated content only.
- **SQL Injection**: N/A — no database. All data is file-based JSON.
- **AI Prompt Injection**: System prompt is server-side only; user messages are sandboxed.
- **CSP**: Configure in `next.config.mjs` headers for production.

## 🌐 Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

Set environment variables in Vercel dashboard.

### Self-hosted

```bash
npm run build
npm start
```

Requires Node.js 18+. PM2 recommended for process management.

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
RUN npm ci --omit=dev
CMD ["npm", "start"]
```

## 📋 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_AI_PROVIDER` | No | `ollama` | AI provider: `ollama`, `openrouter`, `groq`, `gemini` |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | No | `mistral` | Ollama model name |
| `OPENROUTER_API_KEY` | If using OpenRouter | — | OpenRouter API key |
| `OPENROUTER_MODEL` | No | `mistralai/mistral-7b-instruct:free` | OpenRouter model |
| `GROQ_API_KEY` | If using Groq | — | Groq API key |
| `GROQ_MODEL` | No | `llama3-8b-8192` | Groq model |
| `GEMINI_API_KEY` | If using Gemini | — | Google AI Studio key |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public app URL |

## 🤝 Adding Content Authors

The platform is designed so non-engineers can add content:
1. Write a `.md` file following the structure guidelines
2. Add the config entry to `GUIDE_CONFIGS` in `scripts/process-content.ts`
3. Run `npm run content:build`
4. Commit the generated JSON in `public/content/`

Content authors never touch React code.
