#!/usr/bin/env node
/**
 * Push-time validation for Axiozontal.
 *
 * The theme is distributed as a single file that people load straight from
 * this repository, including through Vencord's online-themes field. A broken
 * push reaches them immediately, so these checks run on every push:
 *
 *   1. the file parses as CSS (balanced blocks, strings, comments)
 *   2. the addon metadata header is intact and complete
 *   3. no hashed Discord class names crept in (they rot on every Discord
 *      rehash; the theme matches on prefixes instead)
 *   4. every --hb-* setting used is actually defined in :root
 *   5. no leftover debugging artifacts
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILE = 'Axiozontal.theme.css';

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const css = await readFile(join(ROOT, FILE), 'utf8');
const lineOf = (i) => css.slice(0, i).split('\n').length;

/* Blank comments out in place, keeping length and newlines, so that offsets
   into this string still line up with line numbers in the original. */
const body = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

// 1 ------------------------------------------------------- structural parse
{
  let i = 0;
  let depth = 0;
  const open = [];
  let line = 1;

  while (i < css.length) {
    const c = css[i];
    const next = css[i + 1];

    if (c === '\n') { line++; i++; continue; }

    if (c === '/' && next === '*') {
      const end = css.indexOf('*/', i + 2);
      if (end === -1) { fail(`${FILE}:${line} unterminated /* comment`); break; }
      line += css.slice(i, end).split('\n').length - 1;
      i = end + 2;
      continue;
    }

    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < css.length && css[j] !== c) {
        if (css[j] === '\\') j++;
        if (css[j] === '\n') break;
        j++;
      }
      if (css[j] !== c) { fail(`${FILE}:${line} unterminated ${c} string`); break; }
      i = j + 1;
      continue;
    }

    if (c === '{') { open.push(line); depth++; }
    else if (c === '}') {
      depth--;
      open.pop();
      if (depth < 0) { fail(`${FILE}:${line} stray closing brace`); break; }
    }

    i++;
  }

  if (depth > 0) {
    fail(`${FILE}: ${depth} unclosed block(s), opened at line ${open.join(', ')}`);
  }
}

// paren balance, ignoring comments
{
  const opens = (body.match(/\(/g) ?? []).length;
  const closes = (body.match(/\)/g) ?? []).length;
  if (opens !== closes) {
    fail(`${FILE}: unbalanced parentheses (${opens} open, ${closes} close) — check a var() or calc()`);
  }
}

// 2 ------------------------------------------------------------- addon meta
{
  const header = css.match(/^\/\*\*[\s\S]*?\*\//);
  if (!header) {
    fail(`${FILE}: missing the /** ... */ addon metadata header; BetterDiscord and Vencord both need it`);
  } else {
    for (const field of ['name', 'author', 'version', 'description']) {
      if (!new RegExp(`@${field}\\s+\\S`).test(header[0])) {
        fail(`${FILE}: metadata header is missing @${field}`);
      }
    }
    const version = header[0].match(/@version\s+(\S+)/);
    if (version && !/^\d+\.\d+\.\d+$/.test(version[1])) {
      fail(`${FILE}: @version "${version[1]}" is not semver (major.minor.patch)`);
    }
    const name = header[0].match(/@name\s+(.+)/);
    if (name && name[1].trim() !== 'Axiozontal') {
      fail(`${FILE}: @name is "${name[1].trim()}", expected "Axiozontal"`);
    }
  }
}

// 3 ------------------------------------------- no hashed Discord classnames
{
  for (const m of body.matchAll(/\.[a-zA-Z][\w-]*_{1,2}[0-9a-f]{4,8}\b/g)) {
    fail(
      `${FILE}:${lineOf(m.index)} hashed Discord class "${m[0]}" — ` +
        `use [class*="prefix_"] instead; hashes change on every Discord build`
    );
  }
  // a wildcard that forgot its trailing underscore matches far too much
  for (const m of body.matchAll(/\[class\*=["']([^"']*)["']\]/g)) {
    const v = m[1];
    if (!v.endsWith('_') && !v.startsWith('vc-')) {
      warn(
        `${FILE}:${lineOf(m.index)} [class*="${v}"] has no trailing underscore — ` +
          `it will match unrelated classes`
      );
    }
  }
}

// 4 ----------------------------------------------------- settings integrity
{
  const root = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  const defined = new Set(
    [...(root?.[1] ?? '').matchAll(/(--hb-[\w-]+)\s*:/g)].map((m) => m[1])
  );
  const used = new Set();
  for (const m of css.matchAll(/var\(\s*(--hb-[\w-]+)/g)) used.add(m[1]);
  for (const m of css.matchAll(/style\(\s*(--hb-[\w-]+)\s*:/g)) used.add(m[1]);

  for (const name of used) {
    if (!defined.has(name)) {
      fail(`${FILE}: ${name} is used but never defined in :root`);
    }
  }
  for (const name of defined) {
    if (!used.has(name)) {
      warn(`${FILE}: ${name} is defined in :root but never used`);
    }
  }
}

// 5 ------------------------------------------------------------- leftovers
{
  for (const m of body.matchAll(/\b(outline:\s*\d+px\s+solid\s+(red|lime|magenta)|border:\s*\d+px\s+solid\s+(red|lime|magenta))/gi)) {
    warn(`${FILE}:${lineOf(m.index)} looks like a leftover debug outline: ${m[0]}`);
  }
}

// ------------------------------------------------------------------- report
const rules = css.split('}').length - 1;
console.log(`${FILE}: ${css.split('\n').length} lines, ~${rules} blocks.`);

for (const w of warnings) console.log(`  warning  ${w}`);
for (const e of errors) console.error(`  ERROR    ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} error(s). Not safe to publish.`);
  process.exit(1);
}
console.log(
  warnings.length
    ? `\nOK with ${warnings.length} warning(s).`
    : '\nOK.'
);
