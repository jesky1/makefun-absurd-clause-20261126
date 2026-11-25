import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { isValidEntry, LINE } from "./main.ts";

test("entry is exactly one absurd ToS clause, one sentence, 1..200 chars", () => {
  assert.equal(LINE.split("\n").length, 1, "must be exactly one line");
  assert.ok(LINE.length >= 1 && LINE.length <= 200, `length ${LINE.length} must be 1..200`);
  assert.equal(LINE, LINE.trim(), "no leading/trailing whitespace");
  assert.equal((LINE.match(/[.!?]/g) ?? []).length, 1, "must be exactly one sentence");
  assert.ok(LINE.endsWith("."), "must end with a period");
  assert.match(LINE, /by using this service|terms|agree/i, "must read like a ToS clause");
  assert.match(LINE, /soul|sublicensed|demons/i, "must carry a concrete absurd image");
  console.log(`LINE (${LINE.length} chars): ${LINE}`);
});

test("two identical runs write the same line to /output/entry.txt", () => {
  execFileSync("node", ["main.ts"], { cwd: import.meta.dirname, stdio: "pipe" });
  const first = readFileSync("/output/entry.txt", "utf8");
  execFileSync("node", ["main.ts"], { cwd: import.meta.dirname, stdio: "pipe" });
  const second = readFileSync("/output/entry.txt", "utf8");
  assert.equal(first, LINE, "entry.txt must hold exactly the line, no trailing newline");
  assert.equal(second, first, "two runs must be identical");
  assert.ok(first.length <= 200, `entry.txt is ${first.length} chars`);
});

test("negative: the exported validator refuses bad lines", () => {
  assert.equal(isValidEntry("x".repeat(200) + "."), false, "201 chars must be refused");
  assert.equal(isValidEntry("Two sentences here. And another one."), false, "two sentences must be refused");
  assert.equal(isValidEntry("No terminator at all"), false, "missing terminator must be refused");
  assert.equal(isValidEntry("   "), false, "whitespace-only must be refused");
  assert.equal(isValidEntry(""), false, "empty must be refused");
  assert.equal(isValidEntry(LINE + " "), false, "trailing whitespace must be refused");
  assert.equal(isValidEntry("A".repeat(199) + "."), true, "exactly 200 chars, one sentence, must pass");
  assert.equal(isValidEntry(LINE), true, "the real entry must pass");
});
