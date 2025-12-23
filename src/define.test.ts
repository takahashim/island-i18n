import { assertEquals } from "@std/assert";
import {
  DEFAULT_COOKIE_MAX_AGE,
  DEFAULT_COOKIE_NAME,
  defineI18n,
} from "./define.ts";

const translations = {
  ja: {
    common: { title: "こんにちは", items: "{count}件" },
  },
  en: {
    common: { title: "Hello", items: "{count} items" },
  },
};

const i18n = defineI18n({
  locales: ["ja", "en"] as const,
  defaultLocale: "ja",
  translations,
});

Deno.test("defineI18n", async (t) => {
  await t.step("exposes configuration", () => {
    assertEquals(i18n.locales, ["ja", "en"]);
    assertEquals(i18n.defaultLocale, "ja");
    assertEquals(i18n.cookieName, DEFAULT_COOKIE_NAME);
    assertEquals(i18n.cookieMaxAge, DEFAULT_COOKIE_MAX_AGE);
  });

  await t.step("detectLocale prioritizes cookie", () => {
    const req = new Request("http://example.com", {
      headers: {
        Cookie: "locale=en",
        "Accept-Language": "ja",
      },
    });
    assertEquals(i18n.detectLocale(req), "en");
  });

  await t.step("detectLocale falls back to Accept-Language", () => {
    const req = new Request("http://example.com", {
      headers: { "Accept-Language": "en-US" },
    });
    assertEquals(i18n.detectLocale(req), "en");
  });

  await t.step("detectLocale returns default when no headers", () => {
    const req = new Request("http://example.com");
    assertEquals(i18n.detectLocale(req), "ja");
  });

  await t.step("getTranslations returns correct data", () => {
    assertEquals(i18n.getTranslations("ja"), translations.ja);
    assertEquals(i18n.getTranslations("en"), translations.en);
  });

  await t.step("createState returns complete state", () => {
    const req = new Request("http://example.com", {
      headers: { "Accept-Language": "en" },
    });
    const state = i18n.createState(req);
    assertEquals(state.locale, "en");
    assertEquals(state.translations, translations.en);
  });
});

Deno.test("defineI18n with custom cookie config", async (t) => {
  const customI18n = defineI18n({
    locales: ["ja", "en"] as const,
    defaultLocale: "ja",
    translations,
    cookie: {
      name: "lang",
      maxAge: 3600,
    },
  });

  await t.step("uses custom cookie name", () => {
    assertEquals(customI18n.cookieName, "lang");
  });

  await t.step("uses custom cookie maxAge", () => {
    assertEquals(customI18n.cookieMaxAge, 3600);
  });

  await t.step("reads from custom cookie", () => {
    const req = new Request("http://example.com", {
      headers: { Cookie: "lang=en" },
    });
    assertEquals(customI18n.detectLocale(req), "en");
  });
});
