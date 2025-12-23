/**
 * Factory function for creating i18n instance
 */

import type { I18nConfig, I18nInstance, I18nState } from "./types.ts";
import { detectLocaleFromHeader, getLocaleFromCookie } from "./detect.ts";

/** Default cookie name for locale preference */
export const DEFAULT_COOKIE_NAME = "locale";

/** Default cookie max age (1 year in seconds) */
export const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Create an i18n instance with the given configuration.
 *
 * @param config - I18n configuration
 * @returns I18n instance with detection and translation methods
 *
 * @example
 * import ja from "./translations/ja.json" with { type: "json" };
 * import en from "./translations/en.json" with { type: "json" };
 *
 * const i18n = defineI18n({
 *   locales: ["ja", "en"] as const,
 *   defaultLocale: "ja",
 *   translations: { ja, en },
 * });
 *
 * // In middleware
 * const state = i18n.createState(req);
 * ctx.state.locale = state.locale;
 * ctx.state.translations = state.translations;
 */
export function defineI18n<
  const TLocales extends readonly string[],
  TTranslations extends Record<string, unknown>,
>(
  config: I18nConfig<TLocales, TTranslations>,
): I18nInstance<TLocales[number], TTranslations> {
  const {
    locales,
    defaultLocale,
    translations,
    cookie = {},
  } = config;

  const cookieName = cookie.name ?? DEFAULT_COOKIE_NAME;
  const cookieMaxAge = cookie.maxAge ?? DEFAULT_COOKIE_MAX_AGE;

  function detectLocale(req: Request): TLocales[number] {
    // 1. Check cookie first (user preference)
    const cookieLocale = getLocaleFromCookie(req, cookieName, locales);
    if (cookieLocale) return cookieLocale;

    // 2. Check Accept-Language header
    const acceptLanguage = req.headers.get("Accept-Language");
    return detectLocaleFromHeader(acceptLanguage, locales, defaultLocale);
  }

  function getTranslations(locale: TLocales[number]): TTranslations {
    return translations[locale];
  }

  function createState(
    req: Request,
  ): I18nState<TLocales[number], TTranslations> {
    const locale = detectLocale(req);
    return {
      locale,
      translations: getTranslations(locale),
    };
  }

  return {
    locales,
    defaultLocale,
    cookieName,
    cookieMaxAge,
    detectLocale,
    getTranslations,
    createState,
  };
}
