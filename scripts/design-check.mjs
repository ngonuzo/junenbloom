#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const TOKENS_FILE = path.join(SRC_DIR, "styles", "tokens.css");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (/\.(tsx|ts|css)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const errors = [];
const files = walk(SRC_DIR);

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, "utf8");

  // 1. No <hr> elements (DR-14)
  if (/<hr\b/i.test(content)) {
    errors.push(`${rel}: Forbidden <hr> element found (DR-14: no line separators).`);
  }

  // 2. No Tailwind divide-x or divide-y utilities (DR-14)
  if (/\bdivide-[xy]\b/.test(content)) {
    errors.push(`${rel}: Forbidden divide-x/divide-y class found (DR-14: no divider lines).`);
  }

  // 3. No black text classes (DR-11)
  if (/\btext-black\b|\btext-zinc-950\b|\btext-gray-950\b/.test(content)) {
    errors.push(`${rel}: Forbidden black text class found (DR-11: use --ink or --emerald).`);
  }

  // 4. No raw hex colours outside src/styles/tokens.css (T1.2 / T1.11)
  if (path.resolve(file) !== path.resolve(TOKENS_FILE)) {
    // Allow string literals inside dev documentation tables if explicitly marked, otherwise block raw hex
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      if (line.includes("design-check-allow-hex")) return;
      const hexMatch = line.match(/#[0-9A-Fa-f]{3,8}\b/);
      if (hexMatch) {
        errors.push(`${rel}:${idx + 1}: Raw hex "${hexMatch[0]}" found outside src/styles/tokens.css.`);
      }
    });
  }
}

if (errors.length > 0) {
  console.error("Design Integrity Check Failed (DR-11 / DR-14 / NFR-10):");
  for (const err of errors) {
    console.error("  - " + err);
  }
  process.exit(1);
} else {
  console.log("Design Integrity Check Passed: Zero dividers, zero black text, zero off-token hex values.");
}
