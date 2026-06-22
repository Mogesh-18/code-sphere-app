# HTML5 Professional Developer Handbook
### Internal Onboarding Documentation — Frontend Engineering

## 1. Introduction

### What HTML Is

HTML (HyperText Markup Language) is the standard markup language used to create the structure and content of web pages. It is not a programming language — it defines what content is and what role it plays.

Every web page on the internet is built on HTML. React renders HTML. Vue renders HTML. Angular renders HTML.

### Why Companies Use HTML

HTML is the non-negotiable foundation of all web development. The browser only understands HTML, CSS, and JavaScript.

## 2. Core Fundamentals

### Document Structure

Every HTML document follows a required base structure:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Title</title>
  </head>
  <body>
    <!-- visible content -->
  </body>
</html>
```

**`<!DOCTYPE html>`** — Tells the browser to render in standards mode.

**`<html lang="en">`** — The `lang` attribute is mandatory. It informs screen readers which language to use.

### Semantic HTML

Semantic HTML means using elements that convey meaning about the content they contain.

| Element | Purpose | Use When |
|---------|---------|----------|
| `<header>` | Page or section header | Top of page or section |
| `<nav>` | Navigation links | Main menu, breadcrumbs |
| `<main>` | Primary content | Once per page |
| `<article>` | Self-contained content | Blog posts, cards |
| `<section>` | Themed grouping | Chapter-like divisions |
| `<aside>` | Supplementary content | Sidebars, callouts |
| `<footer>` | Closing content | Bottom of page or section |

### Headings

Headings establish document outline and hierarchy:

```html
<h1>Main Page Topic</h1>
  <h2>Major Section</h2>
    <h3>Sub-section</h3>
```

Rules:
- Use only one `<h1>` per page.
- Never skip heading levels.
- Use headings for structure, never for styling.

## 3. Forms

### Basic Form Structure

```html
<form action="/submit" method="POST" novalidate>
  <div class="form-group">
    <label for="full-name">Full Name *</label>
    <input
      type="text"
      id="full-name"
      name="fullName"
      autocomplete="name"
      required
      aria-required="true"
    />
  </div>
  <button type="submit">Submit</button>
</form>
```

### Input Types

```html
<input type="text" />        <!-- General text -->
<input type="email" />       <!-- Email address -->
<input type="password" />    <!-- Password (masked) -->
<input type="tel" />         <!-- Phone number -->
<input type="date" />        <!-- Date picker -->
<input type="checkbox" />    <!-- Checkbox -->
<input type="radio" />       <!-- Radio button -->
<input type="hidden" />      <!-- Hidden value -->
```

## 4. Beginner Mistakes

### Mistake 1: Missing Alt Text

**Wrong Way**
```html
<img src="photo.jpg" />
<img src="logo.png" alt="logo" />
```

**Correct Way**
```html
<img src="photo.jpg" alt="Team photo at the annual company retreat" />
<img src="logo.png" alt="Acme Corporation — Home" />
<!-- Decorative image: -->
<img src="divider.png" alt="" role="presentation" />
```

**Why It Matters**
Missing alt text is a Level A WCAG violation. Screen readers cannot describe images without it.

### Mistake 2: Using Divs for Everything

**Wrong Way**
```html
<div class="header">
  <div class="nav">
    <div onclick="location='/'">Home</div>
  </div>
</div>
```

**Correct Way**
```html
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
```

**Why It Matters**
Screen readers announce landmark elements by name. `<nav>` is announced as "navigation". `<div class="nav">` is announced as nothing.

## 5. Accessibility Guidelines

### WCAG Fundamentals

WCAG 2.1 is organised around four principles: **Perceivable, Operable, Understandable, Robust** (POUR).

Conformance levels:
- **Level A** — Minimum. Must be met.
- **Level AA** — Standard. Required by most laws.
- **Level AAA** — Enhanced. Not required for all content.

### Focus Management

```html
<!-- Skip navigation link — first element in body -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Main content target -->
<main id="main-content">
  <!-- content -->
</main>
```

### Accessible Forms

```html
<!-- Error state -->
<div class="form-group">
  <label for="email">Email Address</label>
  <input
    type="email"
    id="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" role="alert">
    Please enter a valid email address.
  </p>
</div>
```

## 6. SEO Guidelines

### Title Tag

```html
<!-- Format: Primary keyword — Brand Name -->
<title>Frontend Developer Guide — DevLearn</title>
```

Rules:
- Maximum 60 characters.
- Every page must have a unique title.
- Include the primary keyword near the beginning.

### Meta Description

```html
<meta
  name="description"
  content="Complete HTML5 guide covering semantic markup, accessibility, forms, and production standards."
/>
```

### Structured Data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "HTML5 Professional Guide",
  "author": { "@type": "Person", "name": "DevLearn" }
}
</script>
```
