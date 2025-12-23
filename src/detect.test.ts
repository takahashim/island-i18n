import { assertEquals } from "@std/assert";
import { detectLocaleFromHeader, getLocaleFromCookie } from "./detect.ts";

const LOCALES = ["ja", "en"] as const;

Deno.test("detectLocaleFromHeader", async (t) => {
  await t.step("returns default for null header", () => {
    const result = detectLocaleFromHeader(null, LOCALES, "ja");
    assertEquals(result, "ja");
  });

  await t.step("returns default for empty string", () => {
    const result = detectLocaleFromHeader("", LOCALES, "ja");
    assertEquals(result, "ja");
  });

  await t.step("detects simple locale", () => {
    assertEquals(detectLocaleFromHeader("ja", LOCALES, "en"), "ja");
    assertEquals(detectLocaleFromHeader("en", LOCALES, "ja"), "en");
  });

  await t.step("extracts language from locale with region", () => {
    assertEquals(detectLocaleFromHeader("en-US", LOCALES, "ja"), "en");
    assertEquals(detectLocaleFromHeader("ja-JP", LOCALES, "en"), "ja");
  });

  await t.step("respects q-value priority", () => {
    assertEquals(
      detectLocaleFromHeader("en;q=0.5,ja;q=0.9", LOCALES, "en"),
      "ja",
    );
  });

  await t.step("treats missing q-value as 1", () => {
    assertEquals(detectLocaleFromHeader("ja,en;q=0.9", LOCALES, "en"), "ja");
  });

  await t.step("falls back to supported locale", () => {
    assertEquals(
      detectLocaleFromHeader("fr-FR,fr;q=0.9,en-US;q=0.8", LOCALES, "ja"),
      "en",
    );
  });

  await t.step("returns default for unsupported locales", () => {
    assertEquals(detectLocaleFromHeader("fr-FR,de-DE", LOCALES, "ja"), "ja");
  });

  await t.step("is case-insensitive", () => {
    assertEquals(detectLocaleFromHeader("EN-US", LOCALES, "ja"), "en");
  });
});

Deno.test("getLocaleFromCookie", async (t) => {
  await t.step("returns null when no cookie header", () => {
    const req = new Request("http://example.com");
    assertEquals(getLocaleFromCookie(req, "locale", LOCALES), null);
  });

  await t.step("returns null when locale cookie not present", () => {
    const req = new Request("http://example.com", {
      headers: { Cookie: "session=abc; theme=dark" },
    });
    assertEquals(getLocaleFromCookie(req, "locale", LOCALES), null);
  });

  await t.step("extracts locale from cookie", () => {
    const req = new Request("http://example.com", {
      headers: { Cookie: "locale=ja" },
    });
    assertEquals(getLocaleFromCookie(req, "locale", LOCALES), "ja");
  });

  await t.step("extracts locale from multiple cookies", () => {
    const req = new Request("http://example.com", {
      headers: { Cookie: "session=abc; locale=en; theme=dark" },
    });
    assertEquals(getLocaleFromCookie(req, "locale", LOCALES), "en");
  });

  await t.step("returns null for unsupported locale", () => {
    const req = new Request("http://example.com", {
      headers: { Cookie: "locale=fr" },
    });
    assertEquals(getLocaleFromCookie(req, "locale", LOCALES), null);
  });
});
