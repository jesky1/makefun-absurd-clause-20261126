import { mkdirSync, writeFileSync } from "node:fs";

// The Absurd Clause Contest — exactly one absurd terms-of-service clause,
// at most 200 characters, one original English sentence, deadpan legal
// boilerplate that quietly turns absurd.
export const LINE =
  "By using this service, you agree that your soul is licensed to us on a non-exclusive, royalty-free basis, and may be sublicensed to third-party demons for marketing purposes.";

// The gate allows 1..200 characters and exactly one line: refuse to write
// an invalid entry rather than ship a file the judge never sees. The
// clause must also be exactly one sentence (a single terminal period,
// no other sentence terminator) with no leading/trailing whitespace.
const terminators = LINE.match(/[.!?]/g) ?? [];
if (
  LINE.length < 1 ||
  LINE.length > 200 ||
  LINE.includes("\n") ||
  LINE !== LINE.trim() ||
  terminators.length !== 1 ||
  !LINE.endsWith(".")
) {
  console.error(`invalid entry: ${LINE.length} chars`);
  process.exit(1);
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", LINE, "utf8");
console.log(LINE);
