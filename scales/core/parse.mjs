// Reads a folder of markdown into notes made of sparks (paragraphs / bullets).
// Plain files are the whole interface: nothing here watches *you*, only what you wrote down.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep, basename } from 'node:path';

const IGNORE_DIRS = new Set(['.scales', '.obsidian', '.git', 'node_modules', '.trash']);

export async function listMarkdown(dir) {
  const out = [];
  async function walk(d) {
    let entries;
    try { entries = await readdir(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.') && e.isDirectory()) continue;
      if (e.isDirectory()) {
        if (!IGNORE_DIRS.has(e.name)) await walk(join(d, e.name));
      } else if (e.name.toLowerCase().endsWith('.md')) {
        out.push(join(d, e.name));
      }
    }
  }
  await walk(dir);
  return out.sort();
}

export async function readCorpus(dir) {
  const files = await listMarkdown(dir);
  const notes = [];
  for (const file of files) {
    const [raw, st] = await Promise.all([readFile(file, 'utf8'), stat(file)]);
    const id = relative(dir, file).split(sep).join('/').replace(/\.md$/i, '');
    notes.push(parseNote(id, raw, st.mtimeMs));
  }
  return notes;
}

export function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey) { meta[listKey].push(unquote(item[1])); continue; }
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const [, k, v] = kv;
    listKey = null;
    if (v === '') { meta[k] = []; listKey = k; }
    else if (/^\[.*\]$/.test(v)) meta[k] = v.slice(1, -1).split(',').map(s => unquote(s.trim())).filter(Boolean);
    else if (v === 'true' || v === 'false') meta[k] = v === 'true';
    else meta[k] = unquote(v);
  }
  return { meta, body: raw.slice(m[0].length) };
}

const unquote = s => s.replace(/^["']|["']$/g, '');

export function parseNote(id, raw, mtimeMs = Date.now()) {
  const { meta, body } = parseFrontmatter(raw);
  let title = meta.title;
  let rest = body;
  const h1 = body.match(/^\s*#\s+(.+)\s*$/m);
  if (h1 && body.slice(0, h1.index).trim() === '') {
    title = title || h1[1].trim();
    rest = body.slice(h1.index + h1[0].length);
  }
  title = title || basename(id).replace(/[-_]+/g, ' ');

  const tags = new Set((Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : []).map(t => String(t).replace(/^#/, '').toLowerCase()));
  for (const m of rest.matchAll(/(^|\s)#([A-Za-z][\w\-/]*)/g)) tags.add(m[2].toLowerCase());
  tags.delete('private');

  const links = [...new Set([...rest.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]+)?\]\]/g)].map(m => m[1].trim()))];
  const updatedMeta = meta.updated ? Date.parse(meta.updated) : NaN;
  const isPrivate = meta.private === true || /(^|\s)#private\b/.test(body);

  return {
    id,
    title,
    tags: [...tags].sort(),
    links,
    private: isPrivate,
    updated: Number.isFinite(updatedMeta) ? updatedMeta : mtimeMs,
    body: rest.trim(),
    sparks: splitSparks(rest).map((text, i) => ({ id: `${id}#${i}`, text })),
  };
}

// A spark is a paragraph or a top-level list item (with its indented children).
// A heading is folded into the spark that follows it, so context travels with signal.
export function splitSparks(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  const sparks = [];
  let cur = [];
  let pendingHeading = null;
  let inFence = false;
  const flush = () => {
    const s = cur.join('\n').trim();
    if (s) sparks.push(pendingHeading ? `${pendingHeading}\n${s}` : s), pendingHeading = null;
    cur = [];
  };
  for (const line of lines) {
    if (/^\s*```/.test(line)) { inFence = !inFence; cur.push(line); continue; }
    if (inFence) { cur.push(line); continue; }
    if (/^#{1,6}\s+/.test(line)) {
      flush();
      if (pendingHeading) sparks.push(pendingHeading);
      pendingHeading = line.trim();
      continue;
    }
    if (line.trim() === '') { flush(); continue; }
    if (/^([-*+]|\d+[.)])\s+/.test(line)) flush();
    cur.push(line);
  }
  flush();
  if (pendingHeading) sparks.push(pendingHeading);
  return sparks;
}
