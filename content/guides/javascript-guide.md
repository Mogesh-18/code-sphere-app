# JavaScript Professional Developer Handbook

## 1. Introduction

### What JavaScript Is
JavaScript is the only programming language natively understood by web browsers.

## 2. Core Fundamentals

### Variables

```javascript
const MAX = 5;       // Immutable binding — prefer const
let count = 0;       // Mutable — use only when reassignment needed
// Never use var
```

### Closures

```javascript
function createCounter() {
  let count = 0;
  return {
    increment() { count++; },
    getCount()  { return count; },
  };
}
const counter = createCounter();
counter.increment();
console.log(counter.getCount()); // 1
```

### Arrow Functions

```javascript
const add = (a, b) => a + b;
const square = n => n * n;
const getConfig = () => ({ host: 'localhost' });
```

### Destructuring

```javascript
const { name, age = 0 } = user;
const [first, ...rest] = array;
const { address: { city } } = user;
```

## 3. Async JavaScript

### Promises

```javascript
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => renderPosts(posts))
  .catch(err => showError(err.message))
  .finally(() => hideLoader());
```

### Async/Await

```javascript
async function loadProfile(userId) {
  try {
    const user = await fetchUser(userId);
    const [posts, followers] = await Promise.all([
      fetchPosts(user.id),
      fetchFollowers(user.id),
    ]);
    return { ...user, posts, followers };
  } catch (error) {
    throw new Error(`Profile load failed: ${error.message}`);
  }
}
```

## 4. Array Methods

```javascript
const products = [
  { id: 1, name: 'Laptop', price: 45000, active: true },
  { id: 2, name: 'Monitor', price: 18000, active: false },
];

// map — transform
const names = products.map(p => p.name);

// filter — select
const active = products.filter(p => p.active);

// reduce — accumulate
const total = products.reduce((sum, p) => sum + p.price, 0);

// find — first match
const laptop = products.find(p => p.id === 1);

// some / every
const hasExpensive = products.some(p => p.price > 40000);
const allNamed = products.every(p => p.name);
```

## 5. Event Handling

```javascript
// Named function — can be removed
function handleClick(event) {
  event.preventDefault();
  submitForm(event.currentTarget);
}

btn.addEventListener('click', handleClick);
btn.removeEventListener('click', handleClick);

// Event delegation
document.getElementById('list').addEventListener('click', event => {
  const item = event.target.closest('.item');
  if (!item) return;
  handleItemClick(item.dataset.id);
});
```

## 6. Error Handling

```javascript
class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

async function submitForm(data) {
  try {
    const result = await postData('/api/submit', data);
    return result;
  } catch (error) {
    if (error instanceof AppError) {
      showUserError(error.message);
    } else {
      logError(error);
      throw error;
    }
  }
}
```

## 7. Performance

```javascript
// Debounce: delay until user stops typing
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// DocumentFragment: batch DOM insertions
const fragment = document.createDocumentFragment();
items.forEach(item => fragment.appendChild(createCard(item)));
container.appendChild(fragment); // Single reflow
```
