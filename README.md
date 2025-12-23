# island-i18n

Internationalization library optimized for Island Architecture frameworks like
[Fresh](https://fresh.deno.dev/) (Deno).

## Features

Traditional i18n libraries load translation files and detection logic on the
client. In Island Architecture, this defeats the purpose of minimal client
JavaScript.

`island-i18n` solves this:

- **Zero client-side overhead** - Locale detection happens on the server, not in
  the browser
- **No translation bundles** - Islands receive only the strings they need via
  props
- **TypeScript friendly** - Designed to work well with typed JSON imports
- **No dependencies** - Just one small library, nothing else to install

## Installation

```typescript
import { defineI18n, interpolate } from "jsr:@takahashim/island-i18n";
```

## Quick Start (Fresh)

This example uses [Fresh](https://fresh.deno.dev/) framework.

### 1. Create translation files

```json
// lib/i18n/translations/ja.json
{
  "common": {
    "title": "こんにちは",
    "items": "{count}件"
  }
}
```

```json
// lib/i18n/translations/en.json
{
  "common": {
    "title": "Hello",
    "items": "{count} items"
  }
}
```

### 2. Configure i18n

```typescript
// lib/i18n/index.ts
import { defineI18n } from "jsr:@takahashim/island-i18n";
import ja from "./translations/ja.json" with { type: "json" };
import en from "./translations/en.json" with { type: "json" };

export const i18n = defineI18n({
  locales: ["ja", "en"] as const,
  defaultLocale: "ja",
  translations: { ja, en },
});

// Export types for use in components
export type Locale = (typeof i18n.locales)[number];
export type Translations = typeof ja;
```

### 3. Set up middleware

```typescript
// routes/_middleware.ts
import { define } from "../utils.ts";
import { i18n } from "../lib/i18n/index.ts";

export default define.middleware(async (ctx) => {
  Object.assign(ctx.state, i18n.createState(ctx.req));
  return await ctx.next();
});
```

### 4. Use in routes

```typescript
// routes/index.tsx
import { define } from "../utils.ts";
import { interpolate } from "jsr:@takahashim/island-i18n";

export const handler = define.handlers({
  GET(ctx) {
    return { strings: ctx.state.translations };
  },
});

export default define.page<typeof handler>(function Home({ data }) {
  const { common } = data.strings;

  return (
    <div>
      <h1>{common.title}</h1>
      <p>{interpolate(common.items, { count: 42 })}</p>
    </div>
  );
});
```

### 5. Pass to islands

```typescript
// routes/index.tsx
export const handler = define.handlers({
  GET(ctx) {
    return { strings: ctx.state.translations };
  },
});

export default define.page<typeof handler>(function Home({ data }) {
  return <MyIsland strings={{ common: data.strings.common }} />;
});

// islands/MyIsland.tsx
import type { Translations } from "../lib/i18n/index.ts";

interface Props {
  strings: Pick<Translations, "common">;
}

export default function MyIsland({ strings }: Props) {
  return <h1>{strings.common.title}</h1>;
}
```

## API

### `defineI18n(config)`

Create an i18n instance.

```typescript
const i18n = defineI18n({
  locales: ["ja", "en"] as const,
  defaultLocale: "ja",
  translations: { ja, en },
  cookie: {
    name: "locale", // default: "locale"
    maxAge: 31536000, // default: 1 year
  },
});
```

Returns an object with:

- `locales` - Array of supported locales
- `defaultLocale` - Default locale
- `cookieName` - Cookie name for locale preference
- `cookieMaxAge` - Cookie max age in seconds
- `detectLocale(req)` - Detect locale from request
- `getTranslations(locale)` - Get translations for locale
- `createState(req)` - Create i18n state from request

### `interpolate(template, params)`

Interpolate parameters into a template string.

```typescript
interpolate("{count}件", { count: 100 });
// => "100件"

interpolate("{min}〜{max}", { min: 1, max: 10 });
// => "1〜10"
```

### `detectLocaleFromHeader(header, locales, default)`

Parse Accept-Language header and detect locale.

```typescript
detectLocaleFromHeader("en-US,en;q=0.9,ja;q=0.8", ["en", "ja"], "ja");
// => "en"
```

### `getLocaleFromCookie(req, cookieName, locales)`

Get locale from cookie.

```typescript
getLocaleFromCookie(req, "locale", ["en", "ja"]);
// => "en" or null
```

## How it works

In Island Architecture, there are two types of components:

**Server components** render on the server and have direct access to
translations:

```typescript
// routes/index.tsx
export const handler = define.handlers({
  GET(ctx) {
    return { strings: ctx.state.translations };
  },
});

export default define.page<typeof handler>(function Home({ data }) {
  const { common } = data.strings;
  return <h1>{common.title}</h1>;
});
```

**Islands** hydrate on the client. They cannot access server state, so
translations must be passed as props:

```typescript
// routes/index.tsx
export default define.page<typeof handler>(function Home({ data }) {
  const { counter } = data.strings;
  return <Counter label={counter.label} />;
});

// islands/Counter.tsx
export default function Counter({ label }: { label: string }) {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>{label}: {count}</button>
  );
}
```

Pass only what each island needs - this keeps your client bundle small.

## License

MIT
