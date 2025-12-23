/**
 * Type definitions for island-i18n
 */

/**
 * Configuration for defineI18n
 */
export interface I18nConfig<
  TLocales extends readonly string[],
  TTranslations extends Record<string, unknown>,
> {
  /** Supported locale codes (e.g., ["ja", "en"]) */
  locales: TLocales;
  /** Default locale when detection fails */
  defaultLocale: NoInfer<TLocales[number]>;
  /** Translation data for each locale */
  translations: { [K in TLocales[number]]: TTranslations };
  /** Cookie configuration */
  cookie?: {
    /** Cookie name for storing locale preference */
    name?: string;
    /** Cookie max age in seconds */
    maxAge?: number;
  };
}

/**
 * I18n state attached to request context
 */
export interface I18nState<
  TLocale extends string,
  TTranslations extends Record<string, unknown>,
> {
  locale: TLocale;
  translations: TTranslations;
}

/**
 * I18n instance returned by defineI18n
 */
export interface I18nInstance<
  TLocale extends string,
  TTranslations extends Record<string, unknown>,
> {
  /** Supported locale codes */
  readonly locales: readonly TLocale[];
  /** Default locale */
  readonly defaultLocale: TLocale;
  /** Cookie name */
  readonly cookieName: string;
  /** Cookie max age in seconds */
  readonly cookieMaxAge: number;

  /** Detect locale from request */
  detectLocale(req: Request): TLocale;
  /** Get translations for a locale */
  getTranslations(locale: TLocale): TTranslations;
  /** Create i18n state from request */
  createState(req: Request): I18nState<TLocale, TTranslations>;
}

/**
 * Extract I18nState type from an I18nInstance
 *
 * Uses the return type of createState method to preserve exact translation types.
 *
 * @example
 * const i18n = defineI18n({ ... });
 * type AppState = I18nStateOf<typeof i18n>;
 */
export type I18nStateOf<T> = T extends { createState(req: Request): infer S }
  ? S
  : never;
