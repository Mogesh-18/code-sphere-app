# CSS Professional Developer Handbook

## 1. Introduction

### What CSS Is
CSS (Cascading Style Sheets) controls layout, colour, typography, spacing, and animation.

## 2. Core Fundamentals

### The Box Model

Always use border-box sizing:

```css
*, *::before, *::after { box-sizing: border-box; }
```

### CSS Custom Properties

```css
:root {
  --color-brand: #f59e0b;
  --space-4: 1rem;
}
.button { background: var(--color-brand); }
```

### Flexbox

```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
```

### CSS Grid

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas: "sidebar main";
}
```

## 3. Responsive Design

### Mobile-First

```css
.grid { grid-template-columns: 1fr; }

@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

## 4. BEM Methodology

```css
.card { }
.card__title { }
.card--featured { }
```

## 5. Accessibility

### Focus Indicators

```css
:focus { outline: none; }
:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 3px;
}
```

## 6. Performance

Animate only GPU-composited properties: `transform`, `opacity`, `filter`.
Avoid animating `width`, `height`, `top`, `left`.
