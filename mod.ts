/**
 * island-i18n
 *
 * Internationalization library optimized for Island Architecture frameworks
 * like Fresh (Deno) and Astro.
 *
 * Features:
 * - Server-side locale detection (Cookie, Accept-Language)
 * - Type-safe translations via props
 * - Lightweight string interpolation
 * - No client-side JavaScript overhead for locale detection
 *
 * @example
 * ```typescript
 * // lib/i18n.ts
 * import { defineI18n } from "island-i18n";
 * import ja from "./translations/ja.json" with { type: "json" };
 * import en from "./translations/en.json" with { type: "json" };
 *
 * export const i18n = defineI18n({
 *   locales: ["ja", "en"] as const,
 *   defaultLocale: "ja",
 *   translations: { ja, en },
 * });
 *
 * export type Locale = typeof i18n.locales[number];
 * export type Translations = typeof ja;
 * ```
 *
 * ```typescript
 * // routes/_middleware.ts
 * import { i18n } from "../lib/i18n.ts";
 *
 * export default async (ctx) => {
 *   const { locale, translations } = i18n.createState(ctx.req);
 *   ctx.state.locale = locale;
 *   ctx.state.translations = translations;
 *   return await ctx.next();
 * };
 * ```
 *
 * ```typescript
 * // routes/index.tsx
 * export default function Home({ data }) {
 *   const { common } = data.translations;
 *   return <h1>{common.title}</h1>;
 * }
 * ```
 *
 * @module
 */

// Main factory function
export {
  DEFAULT_COOKIE_MAX_AGE,
  DEFAULT_COOKIE_NAME,
  defineI18n,
} from "./src/define.ts";

// Utility functions
export { interpolate } from "./src/interpolate.ts";
export { setLocaleCookie } from "./src/cookie.ts";

// Types
export type {
  I18nConfig,
  I18nInstance,
  I18nState,
  I18nStateOf,
} from "./src/types.ts";
export type { SetLocaleCookieOptions } from "./src/cookie.ts";
