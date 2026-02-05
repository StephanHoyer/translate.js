---
name: translate-js-i18n
description: Use the lightweight translate.js library to handle internationalization (i18n) in JavaScript web applications. This skill provides guidance on initializing the library, defining translation messages, using placeholders, plural forms, nested keys, gender/variant subkeys, aliases, VDOM-friendly array output, and dynamic locale switching. Invoke this skill when the user needs to implement, debug, extend, or refactor i18n logic using translate.js in frontend or Node.js code.
---

# translate.js i18n Library

## Overview & When to Use This Skill

Use this skill for any task involving **translate.js** — the small (~1.5 KB min+gzip) i18n micro-library by Stephan Hoyer.

Typical use cases:

- Adding multi-language support to vanilla JS, React, Preact, Vue, Svelte, etc.
- Simple string interpolation with named or positional placeholders
- Basic pluralization (0, 1, n + exact matches)
- Single-level sub-keys with `*` fallback
- Reusing strings via `{{alias}}` syntax
- Returning arrays instead of strings (for safe VDOM/component interpolation)
- Debugging missing translations

Do NOT use this skill for other libraries (i18next, formatjs, polyglot, Lingui, etc.) unless explicitly comparing or migrating to/from translate.js.

## Core Usage Pattern

1. Install the library:

   ```bash
   npm install translate.js
   ```

2. Import and initialize

   ```js
   import translate from 'translate.js';

  const messages = {
    greeting: 'Hello {name}!',
    items: {
      0: 'no items',
      1: 'one item',
      n: '{count} items'
    },
    button: {
      '*': 'Click me',
      submit: 'Send'
    }
  };

  const t = translate(messages, {
    debug: false,
    useKeyForMissingTranslation: true,
    array: false,           // set true for VDOM/array output
    resolveAliases: false
  });
  ```

  Basic translation calls:

  ```js
  t('greeting', { name: 'World' });               // → "Hello World!"
  t('items', 0);                                  // → "no items"
  t('items', 1);                                  // → "one item"
  t('items', 5);                                  // → "5 items" (uses {count} ← 5)
  t('button');                                    // → "Click me" (default *)
  t('button', 'submit');                          // → "Send"
  t('button', 'missing');                         // → "Click me" (falls back to *)
  ```

## Key Features & Exact Capabilities

### Placeholders

- Named: `{name}`, `{count}`, etc.
0 Positional: `{0}`, `{1}` (when passing array)

```js
t('like', { thing: 'pizza' });                  // named
t('eat', ['apples', 'bananas']);                // positional → "eat apples and bananas"
```

### Pluralization

Define an object with numeric keys (exact matches) and/or `n` (fallback).

```js
const messages = {
  likes: {
    0: 'Nobody likes this',
    1: 'One person likes this',
    n: '{n} people like this'
  }
};

t('likes', 0);   // → "Nobody likes this"
t('likes', 42);  // → "42 people like this"
```

Custom pluralization rules are not built-in. You must supply your own `pluralize` function if needed:

```js
const t = translate(messages, {
  pluralize: (n) => n === 1 ? 'one' : n === 2 ? 'two' : 'many'
});
```

### Sub-keys (single level only)

Only one sub-key level is supported — pass the sub-key as second argument:

```js
t('button', 'submit');   // looks for messages.button.submit
t('button', 'cancel');   // → messages.button['*'] if missing
```

Deep nesting (`t('form.error.required')`) is not supported natively..

### Aliases

Reuse strings with `{{key}}` syntax:

```js
const messages = {
  support: 'Contact support',
  footer: 'Need help? {{support}}'
};

const t = translate(messages, { resolveAliases: true });
t('footer');  // → "Need help? Contact support"
```

Or resolve manually: `translate.resolveAliases(messages)`.

### VDOM / Safe Interpolation (array mode)

```js
const t = translate(messages, { array: true });

t('welcome', {
  name: 'Ada',
  icon: '<img src="star.svg" alt="star">'
});
// → ['Welcome ', '<img src="star.svg" alt="star">', ', Ada!']
```

Use `t.arr(...)` shorthand when array mode is off.

```js
t.arr('welcome', { name: 'Bob', icon: '<img src="star.svg">' });
```

### Missing Translations & Debug

- Default: returns the key itself
- `debug: true` → logs missing keys and wraps output in `@@key@@`

### Dynamic Locale Switching

```js
t.keys = newMessagesForAnotherLanguage;  // just replace the object
```

## Best Practices

- Keep messages flat or with only one level of sub-keys
- Always include `n` in plural objects as fallback
- Prefer named placeholders (`{name}`) over positional when readability matters
- Use `array: true` in React/Preact/Vue/Svelte projects when interpolating components
- Enable `resolveAliases: true` when using `{{…}}` syntax
- Use `debug: true` during development

## Quick Reference Examples

```js
t('cart.summary', 3, { item: 'apple' });  
// messages.cart.summary.n = "{item} × {n}" → "apple × 3"

t('greeting', 1, { name: 'Alice' });     
// messages.greeting.1 = "Hello {name}!" → "Hello Alice!"
```

Use this skill when the user is working specifically with `translate.js`. Stick to these patterns — do not assume dot-notation nesting, multiple sub-key arguments, gender variants, or complex plural selectors unless the user provides a custom `pluralize` function.
