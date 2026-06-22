'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
    Play, RotateCcw, Maximize2, Minimize2, Code2, Eye,
    ChevronDown, Copy, Check, Columns2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Lazy-load Monaco to avoid SSR issues
const MonacoEditor = dynamic(
    () => import('@monaco-editor/react').then(m => m.default),
    { ssr: false, loading: () => <EditorSkeleton /> }
)

// ──────────────────────────────────────────────────
// Language definitions
// ──────────────────────────────────────────────────

type Language = 'html' | 'css' | 'javascript' | 'jquery' | 'php'

interface LanguageConfig {
    label: string
    monacoLang: string
    icon: string
    defaultCode: string
    renderMode: 'iframe' | 'php-demo'
}

const LANGUAGES: Record<Language, LanguageConfig> = {
    html: {
        label: 'HTML',
        monacoLang: 'html',
        icon: '🌐',
        renderMode: 'iframe',
        defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Page</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 2rem;
      background: #f8fafc;
      color: #1e293b;
    }
    h1 { color: #f59e0b; font-size: 2rem; margin-bottom: 1rem; }
    .card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      max-width: 400px;
    }
    button {
      background: #f59e0b;
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      margin-top: 1rem;
    }
    button:hover { background: #d97706; }
  </style>
</head>
<body>
  <h1>Hello, DevLearn! 👋</h1>
  <div class="card">
    <p>Edit this code and see changes live.</p>
    <button onclick="this.textContent = 'Clicked! ✓'">Click Me</button>
  </div>
</body>
</html>`,
    },
    css: {
        label: 'CSS',
        monacoLang: 'css',
        icon: '🎨',
        renderMode: 'iframe',
        defaultCode: `/* Try editing these styles */
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.card h2 {
  font-size: 1.5rem;
  color: #1e1b4b;
  margin-bottom: 0.75rem;
}

.card p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.btn {
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}`,
    },
    javascript: {
        label: 'JavaScript',
        monacoLang: 'javascript',
        icon: '⚡',
        renderMode: 'iframe',
        defaultCode: `// DevLearn JavaScript Playground
// Edit and run JavaScript with live preview

// Counter example demonstrating closures
function createCounter(start = 0) {
  let count = start;
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    reset()     { count = start; return count; },
    getCount()  { return count; },
  };
}

const counter = createCounter(0);

// Render UI
document.body.innerHTML = \`
  <style>
    body { font-family: system-ui; padding: 2rem; background: #0f0f1a; color: #f0f0f6; }
    h2 { color: #f59e0b; margin-bottom: 1.5rem; }
    .count { font-size: 4rem; font-weight: 800; color: #f59e0b; text-align: center; margin: 1.5rem 0; }
    .btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    button {
      padding: 0.75rem 1.5rem; border: none; border-radius: 10px;
      font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.15s;
    }
    button:hover { transform: translateY(-2px); }
    .inc { background: #f59e0b; color: #000; }
    .dec { background: #0f0f1a; color: #f59e0b; border: 2px solid #f59e0b; }
    .rst { background: #1a1a28; color: #9494aa; border: 1px solid #2a2a42; }
  </style>
  <h2>⚡ Closure Counter</h2>
  <div class="count" id="display">0</div>
  <div class="btns">
    <button class="dec" onclick="update(counter.decrement())">−</button>
    <button class="inc" onclick="update(counter.increment())">+</button>
    <button class="rst" onclick="update(counter.reset())">Reset</button>
  </div>
\`;

function update(val) {
  document.getElementById('display').textContent = val;
}`,
    },
    jquery: {
        label: 'jQuery',
        monacoLang: 'javascript',
        icon: '🔮',
        renderMode: 'iframe',
        defaultCode: `// jQuery Playground — jQuery 3.7 loaded automatically

$(function() {
  // DOM is ready — safe to query elements

  const $output = $('#output');

  function log(msg) {
    $output.prepend(
      $('<div>').addClass('log-entry').html(msg)
    );
  }

  // Delegated event — works on dynamically added items too
  $(document).on('click', '.item', function() {
    const text = $(this).text();
    $(this).toggleClass('selected');
    log(\`Clicked: <strong>\${text}</strong> — selected: \${$(this).hasClass('selected')}\`);
  });

  $('#add-btn').on('click', function() {
    const count = $('.item').length + 1;
    $('.list').append(
      $('<div>').addClass('item').text(\`Item \${count}\`)
    );
    log(\`Added item <strong>\${count}</strong>\`);
  });

  $('#clear-btn').on('click', function() {
    $output.empty();
    log('Log cleared');
  });
});`,
    },
    php: {
        label: 'PHP',
        monacoLang: 'php',
        icon: '🐘',
        renderMode: 'php-demo',
        defaultCode: `<?php
declare(strict_types=1);

// PHP Playground — Educational Sandbox
// Note: PHP executes server-side. This demo shows
// common PHP patterns with simulated output.

// Arrays and iteration
$products = [
    ['name' => 'Laptop',  'price' => 45000, 'category' => 'electronics'],
    ['name' => 'Monitor', 'price' => 18000, 'category' => 'electronics'],
    ['name' => 'Desk',    'price' => 12000, 'category' => 'furniture'],
    ['name' => 'Chair',   'price' => 8000,  'category' => 'furniture'],
];

// Filter: electronics only
$electronics = array_filter(
    $products,
    fn($p) => $p['category'] === 'electronics'
);

// Map: format prices
$formatted = array_map(
    fn($p) => array_merge($p, [
        'formatted_price' => '₹' . number_format($p['price'])
    ]),
    $electronics
);

// Calculate total
$total = array_sum(array_column($products, 'price'));

echo "=== Electronics Catalogue ===\\n";
foreach ($formatted as $product) {
    printf("%-12s %s\\n", $product['name'], $product['formatted_price']);
}
echo "\\nAll Products Total: ₹" . number_format($total) . "\\n";

// Class example
class Cart {
    private array $items = [];

    public function add(string $name, float $price): self {
        $this->items[] = compact('name', 'price');
        return $this;
    }

    public function total(): float {
        return array_sum(array_column($this->items, 'price'));
    }

    public function count(): int {
        return count($this->items);
    }
}

$cart = new Cart();
$cart->add('Laptop', 45000)->add('Mouse', 1500);

echo "\\n=== Cart ===\\n";
echo "Items: " . $cart->count() . "\\n";
echo "Total: ₹" . number_format($cart->total()) . "\\n";`,
    },
}

// ──────────────────────────────────────────────────
// Example templates
// ──────────────────────────────────────────────────

const EXAMPLES: Record<Language, Array<{ label: string; code: string }>> = {
    html: [
        { label: 'Basic Page', code: LANGUAGES.html.defaultCode },
        {
            label: 'Semantic Layout',
            code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Semantic HTML</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui; background: #f1f5f9; }
    header { background: #1e293b; color: white; padding: 1rem 2rem; }
    nav a { color: #94a3b8; margin-right: 1rem; text-decoration: none; }
    nav a:hover { color: white; }
    main { max-width: 900px; margin: 2rem auto; padding: 0 1rem; display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    article { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    aside { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    footer { text-align: center; padding: 1.5rem; color: #64748b; font-size: .875rem; }
    h1 { font-size: 1.5rem; margin-bottom: .5rem; }
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="#" aria-current="page">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </nav>
  </header>
  <main>
    <article>
      <h1>Article Title</h1>
      <time datetime="2025-01-15">January 15, 2025</time>
      <p style="margin-top:.75rem;color:#475569;line-height:1.7">This uses proper semantic HTML5 elements. The browser and screen readers understand the document structure without needing class names.</p>
    </article>
    <aside>
      <h2 style="font-size:1rem;margin-bottom:.75rem">Related</h2>
      <ul style="list-style:none;color:#475569;font-size:.875rem">
        <li style="margin-bottom:.5rem">→ HTML Best Practices</li>
        <li style="margin-bottom:.5rem">→ CSS Layouts</li>
        <li>→ Accessibility Guide</li>
      </ul>
    </aside>
  </main>
  <footer><p>Built with semantic HTML5</p></footer>
</body>
</html>`,
        },
    ],
    css: [
        { label: 'Card Design', code: LANGUAGES.css.defaultCode },
        {
            label: 'Flexbox Nav',
            code: `* { box-sizing: border-box; margin: 0; }
body { font-family: system-ui; background: #0f172a; padding: 2rem; }

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1e293b;
  padding: 1rem 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.1);
}

.brand {
  font-size: 1.25rem;
  font-weight: 800;
  color: #f59e0b;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 0.25rem;
  list-style: none;
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.15s;
}

.nav-links a:hover { background: rgba(255,255,255,.06); color: white; }
.nav-links a.active { background: rgba(245,158,11,.15); color: #f59e0b; }

.cta {
  background: #f59e0b;
  color: #000;
  font-weight: 700;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background 0.15s;
}
.cta:hover { background: #d97706; }`,
        },
    ],
    javascript: [
        { label: 'Closure Counter', code: LANGUAGES.javascript.defaultCode },
        {
            label: 'Fetch & Render',
            code: `// Fetch API + async/await example

document.body.innerHTML = \`
  <style>
    body { font-family: system-ui; padding: 2rem; background: #0f0f1a; color: #f0f0f6; }
    h2 { color: #f59e0b; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .card { background: #141420; border: 1px solid #2a2a42; border-radius: 12px; padding: 1rem; }
    .card h3 { font-size: 0.9rem; color: white; margin-bottom: 0.5rem; }
    .card p { font-size: 0.8rem; color: #9494aa; }
    .tag { display: inline-block; padding: 0.2rem 0.6rem; background: rgba(245,158,11,.15); 
           color: #f59e0b; border-radius: 999px; font-size: 0.7rem; margin-top: 0.5rem; }
    #status { color: #9494aa; font-size: 0.875rem; }
  </style>
  <h2>⚡ Fetch API Demo</h2>
  <p id="status">Loading posts...</p>
  <div class="grid" id="grid"></div>
\`;

async function loadPosts() {
  const status = document.getElementById('status');
  const grid = document.getElementById('grid');

  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=6');
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    
    const posts = await res.json();
    status.textContent = \`Loaded \${posts.length} posts\`;
    
    grid.innerHTML = posts.map(post => \`
      <div class="card">
        <h3>\${post.title.slice(0, 40)}...</h3>
        <p>\${post.body.slice(0, 80)}...</p>
        <span class="tag">User #\${post.userId}</span>
      </div>
    \`).join('');
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
  }
}

loadPosts();`,
        },
    ],
    jquery: [
        { label: 'Event Delegation', code: LANGUAGES.jquery.defaultCode },
        {
            label: 'AJAX & Tabs',
            code: `// jQuery Tabs with AJAX simulation

$(function() {
  // Tab system with jQuery
  const tabs = [
    { id: 'html', label: 'HTML', content: 'HTML (HyperText Markup Language) is the standard markup language for web pages.' },
    { id: 'css', label: 'CSS', content: 'CSS (Cascading Style Sheets) controls the presentation and layout of HTML elements.' },
    { id: 'js', label: 'JavaScript', content: 'JavaScript is the programming language of the web, enabling dynamic interactivity.' },
  ];

  const $container = $('#app');
  const tabsHtml = tabs.map(t =>
    \`<button class="tab-btn \${t.id === 'html' ? 'active' : ''}" data-tab="\${t.id}">\${t.label}</button>\`
  ).join('');

  $container.html(\`
    <div class="tab-nav">\${tabsHtml}</div>
    <div class="tab-content" id="tab-content">
      <p>\${tabs[0].content}</p>
    </div>
  \`);

  $container.on('click', '.tab-btn', function() {
    const tabId = $(this).data('tab');
    const tab = tabs.find(t => t.id === tabId);
    
    $('.tab-btn').removeClass('active');
    $(this).addClass('active');
    
    $('#tab-content')
      .fadeOut(150, function() {
        $(this).html(\`<p>\${tab.content}</p>\`).fadeIn(200);
      });
  });
});`,
        },
    ],
    php: [
        { label: 'Array Functions', code: LANGUAGES.php.defaultCode },
        {
            label: 'OOP & Classes',
            code: `<?php
declare(strict_types=1);

abstract class Shape {
    abstract public function area(): float;
    abstract public function perimeter(): float;
    
    public function describe(): string {
        return sprintf(
            '%s — Area: %.2f | Perimeter: %.2f',
            get_class($this),
            $this->area(),
            $this->perimeter()
        );
    }
}

class Circle extends Shape {
    public function __construct(private float $radius) {}
    
    public function area(): float {
        return M_PI * $this->radius ** 2;
    }
    
    public function perimeter(): float {
        return 2 * M_PI * $this->radius;
    }
}

class Rectangle extends Shape {
    public function __construct(
        private float $width,
        private float $height
    ) {}
    
    public function area(): float {
        return $this->width * $this->height;
    }
    
    public function perimeter(): float {
        return 2 * ($this->width + $this->height);
    }
}

$shapes = [
    new Circle(5),
    new Rectangle(8, 4),
    new Circle(2.5),
];

echo "=== Shape Calculator ===\\n\\n";
foreach ($shapes as $shape) {
    echo $shape->describe() . "\\n";
}

$totalArea = array_sum(array_map(fn($s) => $s->area(), $shapes));
echo "\\nTotal area: " . number_format($totalArea, 2) . "\\n";`,
        },
    ],
}

// ──────────────────────────────────────────────────
// PHP Interpreter simulation
// ──────────────────────────────────────────────────

function simulatePHP(code: string): string {
    // This is an educational simulation, not a real PHP interpreter.
    // For production, integrate with a backend PHP execution service.
    const lines = code.split('\n')
    const output: string[] = []

    // Extract echo/print statements
    for (const line of lines) {
        const echoMatch = line.match(/^\s*(?:echo|print)\s+["'`](.+?)["'`]\s*;/)
        if (echoMatch) {
            output.push(echoMatch[1].replace(/\\n/g, '\n'))
        }
        const printfMatch = line.match(/^\s*printf\s*\(\s*["'`](.+?)["'`]/)
        if (printfMatch) {
            output.push(printfMatch[1].replace(/%-?\d+s/g, ' ').replace(/\\n/g, '\n'))
        }
    }

    if (output.length === 0) {
        return '// PHP runs server-side.\n// This sandbox shows simulated output.\n// For full PHP execution, set up a local environment.\n\n// Code analysis:\n' +
            lines
                .filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.trim().startsWith('/*'))
                .slice(0, 8)
                .map(l => '  ' + l.trim())
                .join('\n')
    }

    return output.join('')
}

// ──────────────────────────────────────────────────
// Build HTML for iframe
// ──────────────────────────────────────────────────

function buildIframeContent(lang: Language, code: string): string {
    switch (lang) {
        case 'html':
            return code

        case 'css':
            return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${code}</style></head>
<body>
<div class="card"><h2>CSS Preview</h2><p>Your styles applied to this content.</p><a href="#" class="btn">Button</a></div>
</body></html>`

        case 'javascript':
            return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body><script>${code}<\/script></body></html>`

        case 'jquery':
            return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<script src="https://code.jquery.com/jquery-3.7.1.min.js"><\/script>
<style>
  * { box-sizing: border-box; } body { font-family: system-ui; padding: 1.5rem; background: #0f0f1a; color: #f0f0f6; }
  h2 { color: #f59e0b; margin-bottom: 1rem; }
  .list { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1rem; }
  .item { padding: .75rem 1rem; background: #141420; border: 1px solid #2a2a42; border-radius: 8px; cursor: pointer; font-size: .9rem; transition: all .15s; }
  .item:hover { border-color: rgba(245,158,11,.4); }
  .item.selected { background: rgba(245,158,11,.1); border-color: rgba(245,158,11,.4); color: #f59e0b; }
  .btns { display: flex; gap: .75rem; margin-bottom: 1rem; }
  button { padding: .5rem 1rem; border: none; border-radius: 8px; cursor: pointer; font-size: .85rem; font-weight: 600; }
  #add-btn { background: #f59e0b; color: #000; }
  #clear-btn { background: #1a1a28; color: #9494aa; border: 1px solid #2a2a42; }
  #output { max-height: 180px; overflow-y: auto; }
  .log-entry { padding: .4rem .75rem; background: #1a1a28; border-radius: 6px; font-size: .8rem; color: #9494aa; margin-bottom: .35rem; }
  .log-entry strong { color: #f59e0b; }
</style>
</head>
<body>
  <h2>jQuery Playground</h2>
  <div class="btns">
    <button id="add-btn">+ Add Item</button>
    <button id="clear-btn">Clear Log</button>
  </div>
  <div class="list">
    <div class="item">Item 1</div>
    <div class="item">Item 2</div>
    <div class="item">Item 3</div>
  </div>
  <div id="output"></div>
<script>${code}<\/script>
</body></html>`

        default:
            return '<html><body><p>Preview not available</p></body></html>'
    }
}

// ──────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────

export function TryItEditor() {
    const [language, setLanguage] = useState<Language>('html')
    const [code, setCode] = useState(LANGUAGES.html.defaultCode)
    const [previewHtml, setPreviewHtml] = useState('')
    const [phpOutput, setPhpOutput] = useState('')
    const [layout, setLayout] = useState<'split' | 'editor' | 'preview'>('split')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showExamples, setShowExamples] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const runTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

    const config = LANGUAGES[language]

    // Auto-run with debounce
    useEffect(() => {
        clearTimeout(runTimeoutRef.current)
        runTimeoutRef.current = setTimeout(runCode, 600)
        return () => clearTimeout(runTimeoutRef.current)
    }, [code, language])

    function runCode() {
        if (config.renderMode === 'php-demo') {
            setPhpOutput(simulatePHP(code))
        } else {
            const html = buildIframeContent(language, code)
            setPreviewHtml(html)
        }
    }

    function switchLanguage(lang: Language) {
        setLanguage(lang)
        setCode(LANGUAGES[lang].defaultCode)
        setShowExamples(false)
    }

    function resetCode() {
        setCode(LANGUAGES[language].defaultCode)
    }

    async function copyCode() {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
    }

    function loadExample(exCode: string) {
        setCode(exCode)
        setShowExamples(false)
    }

    const showEditor = layout === 'split' || layout === 'editor'
    const showPreview = layout === 'split' || layout === 'preview'

    return (
        <div className={cn(
            'flex flex-col bg-[#07070D] h-full',
            isFullscreen && 'fixed inset-0 z-50'
        )}>
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0F0F1A] border-b border-white/[0.07] shrink-0">

                {/* Language tabs */}
                <div className="flex items-center gap-1">
                    {(Object.keys(LANGUAGES) as Language[]).map(lang => (
                        <button
                            key={lang}
                            onClick={() => switchLanguage(lang)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 border transition-all',
                                language === lang
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                                    : 'text-[var(--text-muted)] border-transparent hover:border-white/[0.08] hover:text-white'
                            )}
                        >
                            <span>{LANGUAGES[lang].icon}</span>
                            {LANGUAGES[lang].label}
                        </button>
                    ))}
                </div>

                <div className="flex-1" />

                {/* Examples dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowExamples(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 border border-white/[0.08] text-[var(--text-secondary)] hover:text-white hover:border-white/[0.16] transition-all"
                    >
                        Examples <ChevronDown size={12} />
                    </button>
                    {showExamples && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-[#141420] border border-white/[0.1] rounded-xl shadow-elevation-3 z-20 overflow-hidden">
                            {EXAMPLES[language].map(ex => (
                                <button
                                    key={ex.label}
                                    onClick={() => loadExample(ex.code)}
                                    className="w-full text-left px-4 py-2.5 text-xs text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-white transition-colors"
                                >
                                    {ex.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <button onClick={resetCode} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white transition-colors" title="Reset">
                    <RotateCcw size={14} />
                </button>
                <button onClick={copyCode} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white transition-colors" title="Copy">
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>

                {/* Layout toggle */}
                <div className="flex items-center gap-0.5 p-1 bg-[#141420] border border-white/[0.08] rounded-lg">
                    {[
                        { id: 'editor', icon: Code2, label: 'Editor only' },
                        { id: 'split', icon: Columns2, label: 'Split view' },
                        { id: 'preview', icon: Eye, label: 'Preview only' },
                    ].map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setLayout(id as typeof layout)}
                            title={label}
                            className={cn(
                                'p-1.5 rounded-md transition-all',
                                layout === id
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'text-[var(--text-muted)] hover:text-white'
                            )}
                        >
                            <Icon size={13} />
                        </button>
                    ))}
                </div>

                {/* Run button */}
                <button
                    onClick={runCode}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-700 hover:bg-emerald-500/30 transition-all"
                >
                    <Play size={12} fill="currentColor" /> Run
                </button>

                <button
                    onClick={() => setIsFullscreen(v => !v)}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white transition-colors"
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
            </div>

            {/* Editor + Preview */}
            <div className="flex flex-1 min-h-0">
                {/* Editor pane */}
                {showEditor && (
                    <div className={cn(
                        'flex flex-col border-r border-white/[0.07] min-h-0',
                        layout === 'split' ? 'w-1/2' : 'flex-1'
                    )}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0A12] border-b border-white/[0.06]">
                            <Code2 size={12} className="text-[var(--text-muted)]" />
                            <span className="text-xs text-[var(--text-muted)]">
                                {config.label} Editor
                            </span>
                        </div>
                        <div className="flex-1 min-h-0">
                            <MonacoEditor
                                language={config.monacoLang}
                                value={code}
                                onChange={val => setCode(val ?? '')}
                                theme="vs-dark"
                                options={{
                                    fontSize: 13,
                                    fontFamily: '"IBM Plex Mono", "Fira Code", monospace',
                                    fontLigatures: true,
                                    minimap: { enabled: false },
                                    lineNumbers: 'on',
                                    wordWrap: 'on',
                                    scrollBeyondLastLine: false,
                                    tabSize: 2,
                                    padding: { top: 16, bottom: 16 },
                                    renderLineHighlight: 'gutter',
                                    cursorBlinking: 'smooth',
                                    smoothScrolling: true,
                                    contextmenu: false,
                                    scrollbar: {
                                        verticalScrollbarSize: 6,
                                        horizontalScrollbarSize: 6,
                                    },
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Preview pane */}
                {showPreview && (
                    <div className={cn(
                        'flex flex-col min-h-0',
                        layout === 'split' ? 'flex-1' : 'flex-1'
                    )}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0A12] border-b border-white/[0.06]">
                            <Eye size={12} className="text-[var(--text-muted)]" />
                            <span className="text-xs text-[var(--text-muted)]">
                                {config.renderMode === 'php-demo' ? 'PHP Output (Simulated)' : 'Live Preview'}
                            </span>
                            <div className="ml-auto flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-2xs text-emerald-400">Live</span>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 bg-white overflow-hidden">
                            {config.renderMode === 'php-demo' ? (
                                <div className="h-full bg-[#0D0D16] p-6 overflow-auto">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-lg">🐘</span>
                                        <span className="text-xs font-mono text-amber-400">PHP Simulated Output</span>
                                    </div>
                                    <pre className="font-mono text-sm text-emerald-300 leading-relaxed whitespace-pre-wrap">
                                        {phpOutput || 'Click Run to see output'}
                                    </pre>
                                </div>
                            ) : (
                                <iframe
                                    ref={iframeRef}
                                    srcDoc={previewHtml}
                                    className="w-full h-full border-0"
                                    sandbox="allow-scripts allow-modals"
                                    title="Live preview"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function EditorSkeleton() {
    return (
        <div className="flex-1 bg-[#0D0D16] p-6">
            <div className="space-y-3">
                {[100, 85, 60, 90, 45, 75, 55, 80].map((w, i) => (
                    <div key={i} className="skeleton h-4 rounded" style={{ width: `${w}%` }} />
                ))}
            </div>
        </div>
    )
}