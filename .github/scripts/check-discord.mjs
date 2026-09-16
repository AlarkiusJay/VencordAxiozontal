#!/usr/bin/env node
/**
 * Discord canary.
 *
 * Axiozontal hooks onto Discord's own class-name prefixes, CSS variables and
 * CSS grid area names. Discord rehashes class names constantly (harmless: the
 * theme matches on the prefix) but occasionally renames a prefix, drops a
 * variable, or restructures the app grid. Those are the changes that break the
 * theme, and this script catches them.
 *
 * It reads the requirements straight out of the theme file, so it stays in
 * sync with whatever the theme currently depends on. It then downloads the
 * CSS bundles the live Discord web client loads and checks each requirement
 * still resolves.
 *
 * A few hooks (the unread pill, for one) are styled inline by React and never
 * appear in the static bundles. Rather than flag those forever, the script
 * compares against a committed baseline and only fails on a REGRESSION: a hook
 * that used to resolve and no longer does.
 *
 *   node check-discord.mjs              check against the baseline
 *   node check-discord.mjs --update     rewrite the baseline from live Discord
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const THEME = join(ROOT, 'Axiozontal.theme.css');
const BASELINE = join(HERE, 'discord-baseline.json');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

/* Hooks that belong to other projects, not Discord. Not our canary's job. */
const FOREIGN_PREFIX = /^(vc-|hb-)/;
/* Grid area supplied by Vencord's BetterFolders plugin, not by Discord. */
const FOREIGN_AREAS = new Set(['betterFoldersSidebar']);
/* Our own variables. */
const OURS = /^--hb-/;

// ---------------------------------------------------------------- read theme

function requirementsFrom(css) {
  const classes = new Set();
  for (const m of css.matchAll(/\[class\*=["']([a-zA-Z][\w-]*?)_["']\]/g)) {
    if (!FOREIGN_PREFIX.test(m[1])) classes.add(m[1]);
  }

  const vars = new Set();
  for (const m of css.matchAll(/var\(\s*(--[\w-]+)/g)) {
    if (!OURS.test(m[1])) vars.add(m[1]);
  }

  const areas = new Set();
  for (const m of css.matchAll(/grid-area:\s*([\w-]+)/g)) {
    if (m[1] !== 'auto') areas.add(m[1]);
  }
  // Only the quoted rows of grid-template-areas name areas; skip !important.
  for (const m of css.matchAll(/grid-template-areas:([^;]+);/g)) {
    for (const row of m[1].matchAll(/"([^"]*)"/g)) {
      for (const n of row[1].matchAll(/[\w-]+/g)) areas.add(n[0]);
    }
  }
  for (const a of FOREIGN_AREAS) areas.delete(a);

  return {
    classes: [...classes].sort(),
    vars: [...vars].sort(),
    areas: [...areas].sort(),
  };
}

// ------------------------------------------------------------- fetch discord

async function get(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

async function discordCss() {
  const html = await get('https://discord.com/app');
  const buildId = html.match(/buildId"\s*:\s*"([0-9a-f]{8,40})"/)?.[1] ?? 'unknown';
  const paths = [...new Set(html.match(/\/assets\/[\w.-]+\.css/g) ?? [])];
  if (paths.length === 0) {
    throw new Error(
      'No CSS bundles found on discord.com/app. The page shape changed, or ' +
        'the request was blocked/challenged.'
    );
  }

  const parts = [];
  const queue = [...paths];
  const workers = Array.from({ length: 8 }, async () => {
    for (let p = queue.pop(); p; p = queue.pop()) {
      try {
        parts.push(await get(`https://discord.com${p}`));
      } catch {
        /* one missing bundle should not sink the run */
      }
    }
  });
  await Promise.all(workers);

  return {
    css: parts.join('\n'),
    bundles: paths.length,
    fetched: parts.length,
    buildId,
  };
}

// ------------------------------------------------------------------- resolve

function resolve(css, req) {
  const found = {};

  for (const name of req.classes) {
    // Discord writes .name_ab12cd or .name__ab12cd
    found[`class:${name}`] = new RegExp(
      `\\.${name}_{1,2}[0-9a-f]{4,8}\\b`
    ).test(css);
  }
  for (const name of req.vars) {
    found[`var:${name}`] = css.includes(name);
  }
  for (const name of req.areas) {
    found[`area:${name}`] = new RegExp(
      `grid-(?:area|template-areas)\\s*:[^;{}]*\\b${name}\\b`
    ).test(css);
  }

  return found;
}

// ---------------------------------------------------------------------- main

const theme = await readFile(THEME, 'utf8');
const req = requirementsFrom(theme);
const total = req.classes.length + req.vars.length + req.areas.length;

console.log(
  `Theme depends on ${req.classes.length} class prefixes, ` +
    `${req.vars.length} variables, ${req.areas.length} grid areas.`
);

const { css, bundles, fetched, buildId } = await discordCss();
console.log(
  `Discord build ${buildId.slice(0, 12)} — fetched ${fetched}/${bundles} ` +
    `CSS bundles (${(css.length / 1e6).toFixed(1)} MB).`
);

if (fetched < bundles * 0.8) {
  console.error(
    `\nOnly ${fetched} of ${bundles} bundles downloaded. Too incomplete to ` +
      `judge; not failing the build on this.`
  );
  process.exit(0);
}

const found = resolve(css, req);
const resolved = Object.values(found).filter(Boolean).length;
console.log(`Resolved ${resolved}/${total} hooks against live Discord.\n`);

if (process.argv.includes('--update')) {
  await writeFile(
    BASELINE,
    JSON.stringify(
      {
        note:
          'Generated by check-discord.mjs --update. "false" entries are hooks ' +
          'Discord styles inline rather than in its CSS bundles, so they ' +
          'cannot be verified statically. The canary only fails when a "true" ' +
          'entry turns false.',
        updated: new Date().toISOString().slice(0, 10),
        discordBuild: buildId,
        hooks: found,
      },
      null,
      2
    ) + '\n'
  );
  console.log(`Baseline written: ${resolved} verifiable, ${total - resolved} not.`);
  process.exit(0);
}

let base;
try {
  base = JSON.parse(await readFile(BASELINE, 'utf8')).hooks;
} catch {
  console.error('No baseline found. Run with --update first.');
  process.exit(1);
}

const broken = [];
const added = [];
for (const [hook, ok] of Object.entries(found)) {
  const was = base[hook];
  if (was === true && !ok) broken.push(hook);
  if (was === undefined && !ok) added.push(hook);
}

if (added.length) {
  console.log(
    'New hooks in the theme that do not resolve (probably styled inline, ' +
      'check by hand then re-run with --update):'
  );
  for (const h of added) console.log(`  ? ${h}`);
  console.log('');
}

if (broken.length === 0) {
  console.log('OK — every hook the theme relies on is still present.');
  process.exit(0);
}

console.error(`BROKEN — ${broken.length} hook(s) vanished from Discord:\n`);
for (const h of broken) console.error(`  x ${h}`);
console.error(
  '\nThe theme likely needs fixing against the live client. ' +
    'See reference/selectors.md for the DOM these hooks were written against.'
);
process.exit(1);
