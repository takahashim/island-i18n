/**
 * Locale detection utilities
 */

/**
 * Parse Accept-Language header and detect the best matching locale.
 *
 * @param acceptLanguage - The Accept-Language header value
 * @param supportedLocales - Array of supported locale codes
 * @param defaultLocale - Fallback locale
 * @returns The detected locale
 *
 * @example
 * detectLocaleFromHeader("en-US,en;q=0.9,ja;q=0.8", ["en", "ja"], "en")
 * // returns "en"
 */
export function detectLocaleFromHeader<T extends string>(
  acceptLanguage: string | null,
  supportedLocales: readonly T[],
  defaultLocale: T,
): T {
  if (!acceptLanguage) return defaultLocale;

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,ja;q=0.8")
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      return {
        code: code.split("-")[0].toLowerCase(),
        q: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  // Find the first supported locale
  for (const { code } of languages) {
    if (supportedLocales.includes(code as T)) {
      return code as T;
    }
  }

  return defaultLocale;
}

/**
 * Get locale from cookie in request.
 *
 * @param req - The request object
 * @param cookieName - Name of the locale cookie
 * @param supportedLocales - Array of supported locale codes
 * @returns The locale from cookie or null
 */
export function getLocaleFromCookie<T extends string>(
  req: Request,
  cookieName: string,
  supportedLocales: readonly T[],
): T | null {
  const cookies = req.headers.get("Cookie");
  if (!cookies) return null;

  const regex = new RegExp(`${cookieName}=(\\w+)`);
  const match = cookies.match(regex);

  if (match && supportedLocales.includes(match[1] as T)) {
    return match[1] as T;
  }

  return null;
}
