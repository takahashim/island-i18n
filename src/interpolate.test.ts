import { assertEquals } from "@std/assert";
import { interpolate } from "./interpolate.ts";

Deno.test("interpolate", async (t) => {
  await t.step("replaces single parameter", () => {
    assertEquals(interpolate("{count}件", { count: 100 }), "100件");
  });

  await t.step("replaces multiple parameters", () => {
    assertEquals(interpolate("{min}〜{max}", { min: 1, max: 10 }), "1〜10");
  });

  await t.step("handles string parameters", () => {
    assertEquals(
      interpolate("Hello, {name}!", { name: "World" }),
      "Hello, World!",
    );
  });

  await t.step("preserves unmatched placeholders", () => {
    assertEquals(interpolate("{a} and {b}", { a: "X" }), "X and {b}");
  });

  await t.step("returns original string when no placeholders", () => {
    assertEquals(interpolate("No placeholders"), "No placeholders");
  });

  await t.step("handles empty params", () => {
    assertEquals(interpolate("Hello!"), "Hello!");
  });

  await t.step("handles number zero", () => {
    assertEquals(interpolate("{count}件", { count: 0 }), "0件");
  });

  await t.step("handles consecutive placeholders", () => {
    assertEquals(interpolate("{a}{b}{c}", { a: "1", b: "2", c: "3" }), "123");
  });

  await t.step("handles special regex characters", () => {
    assertEquals(interpolate("{value}", { value: "$100" }), "$100");
  });

  await t.step("handles multiple occurrences", () => {
    assertEquals(interpolate("{x} + {x} = {y}", { x: 2, y: 4 }), "2 + 2 = 4");
  });
});
