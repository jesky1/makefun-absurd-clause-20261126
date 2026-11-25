import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LINE } from "./main.ts";

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

test("negative: an over-long line is refused, nothing is written", () => {
  const dir = mkdtempSync(join(tmpdir(), "absurd-neg-"));
  try {
    const src = readFileSync(join(import.meta.dirname, "main.ts"), "utf8");
    const start = src.indexOf('export const LINE =');
    const openQuote = src.indexOf('"', start);
    const closeQuote = src.indexOf('";', openQuote + 1);
    const bad = "x".repeat(200) + ".";
    const patched =
      src.slice(0, openQuote) + JSON.stringify(bad) + src.slice(closeQuote + 1);
    const patchedPath = join(dir, "main-bad.ts");
    writeFileSync(patchedPath, patched);
    const run = spawnSync("node", [patchedPath], { encoding: "utf8" });
    assert.notEqual(run.status, 0, "over-long entry must exit non-zero");
    assert.match(run.stderr, /invalid entry/, "must report the invalid entry");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
