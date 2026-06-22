# jQuery Professional Developer Handbook

## 1. Introduction

### What jQuery Is
jQuery is a JavaScript library providing DOM manipulation, event handling, and AJAX. Essential for legacy codebases.

## 2. Core Fundamentals

### Document Ready

```javascript
$(function() {
  // DOM ready — preferred shorthand
  initApp();
});
```

### Selectors

```javascript
$('#hero')           // ID
$('.card')           // Class
$('input[required]') // Attribute
$('.card').first()   // First match
$('.card').eq(2)     // By index
```

### DOM Manipulation

```javascript
$el.text('Safe content');          // XSS-safe
$el.html('<p>Trusted HTML</p>');   // Parses as HTML
$el.addClass('active loading');
$el.removeClass('loading');
$el.toggleClass('expanded');
$el.attr('href', '/page');
$el.data('productId');             // data-product-id
```

## 3. Events

```javascript
// Correct: use .on()
$('#btn').on('click', function(event) {
  event.preventDefault();
  handleClick($(this));
});

// Event delegation — handles dynamic elements
$('#list').on('click', '.item', function() {
  const id = $(this).data('id');
  loadItem(id);
});

// Namespaced events — removable
$('#modal').on('keydown.modal', handleKey);
$('#modal').off('keydown.modal');
```

## 4. AJAX

```javascript
$.ajax({
  url: '/api/products',
  method: 'GET',
  data: { page: 1 },
  dataType: 'json',
})
.done(data => renderProducts(data))
.fail(jqXHR => showError(jqXHR.responseJSON?.message))
.always(() => hideLoader());

// CSRF setup
$.ajaxSetup({
  headers: {
    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
  }
});
```

## 5. Security

### XSS Prevention

```javascript
// SAFE — .text() HTML-escapes content
$('#welcome').text('Hello, ' + userName);

// UNSAFE — .html() parses as HTML
$('#welcome').html('Hello, ' + userName); // XSS risk
```

## 6. Performance

```javascript
// Cache selectors
const $card = $('#product-1'); // One DOM lookup
$card.addClass('featured');
$card.find('.price').text('₹45,000');

// Avoid repeated lookups in loops
const $items = $('.item'); // Cache outside loop
$items.each(function() {
  $(this).addClass('processed');
});
```

## 7. Migration to Vanilla JS

```javascript
// jQuery  → Vanilla
$('#id')           → document.getElementById('id')
$('.cls')          → document.querySelector('.cls')
$el.text(str)      → el.textContent = str
$el.addClass('x')  → el.classList.add('x')
$.get(url, fn)     → fetch(url).then(r=>r.json()).then(fn)
$el.on('click',fn) → el.addEventListener('click', fn)
```
