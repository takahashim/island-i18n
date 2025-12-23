/**
 * Client-side cookie utilities
 */

// Type declaration for browser environment
declare const document: { cookie: string };

import { DEFAULT_COOKIE_MAX_AGE, DEFAULT_COOKIE_NAME } from "./define.ts";

/**
 * Options for setLocaleCookie
 */
export interface SetLocaleCookieOptions {
  /** Cookie name (default: "locale") */
  name?: string;
  /** Cookie max age in seconds (default: 1 year) */
  maxAge?: number;
  /** Cookie path (default: "/") */
  path?: string;
}

/**
 * Set locale preference cookie on the client side.
 *
 * @param locale - The locale to set
 * @param options - Cookie options
 *
 * @example
 * // Basic usage
 * setLocaleCookie("ja");
 *
 * // With custom options
 * setLocaleCookie("en", { name: "lang", maxAge: 60 * 60 * 24 * 30 });
 */
export function setLocaleCookie(
  locale: string,
  options: SetLocaleCookieOptions = {},
): void {
  const name = options.name ?? DEFAULT_COOKIE_NAME;
  const maxAge = options.maxAge ?? DEFAULT_COOKIE_MAX_AGE;
  const path = options.path ?? "/";

  document.cookie =
    `${name}=${locale};path=${path};max-age=${maxAge};SameSite=Lax`;
}
