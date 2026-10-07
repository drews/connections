#!/usr/bin/env node
// Scales server: serves the zoomable cosmos to you, and a membrane-filtered view to agents.
//   SCALES_CORPUS=~/vault node scales/server.mjs
// Binds to 127.0.0.1 by default: this is your brain, not a website.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { watch } from 'node:fs';
import { join, resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWorld } from './core/world.mjs';
import { LEVELS } from './core/levels.mjs';
import { slugify } from './core/text.mjs';
import {
  Store, apertureFor, redactWorld, visibleBeacons, canAddress, renderOutline,
} from './core/membrane.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const CORPUS = resolve(process.env.SCALES_CORPUS || join(here, '..', 'corpus'));
const PORT = Number(process.env.PORT || 4410);
const HOST = process.env.HOST || '127.0.0.1';
const store = new Store(CORPUS);

let world = null;
let building = null;
const clients = new Set();

async function rebuild() {
  building = (async () => {
    const t0 = performance.now();
    world = await buildWorld(CORPUS, { names: await store.names() });
    console.log(`◎ world built: ${world.counts.notes} notes → ${world.counts.constellations} constellations → ${world.counts.territories} territories (${Math.round(performance.now() - t0)}ms)`);
    broadcast('world', { builtAt: world.builtAt });
  })();
  await building;
}

function broadcast(event, data) {
  for (const res of clients) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// --- watch the corpus: edits from your editor, captures, agents all flow back in ---
let timer = null;
function watchCorpus() {
  try {
    watch(CORPUS, { recursive: true }, (_, file) => {
      if (!file) return;
      const f = String(file);
      if (f.startsWith('.scales')) {
        if (/postcards|beacons|membrane/.test(f)) broadcast('membrane', {});
        if (/names/.test(f)) schedule();
        return;
      }
      if (f.endsWith('.md')) schedule();
    });
  } catch (e) {
    console.warn('⚠ file watching unavailable; restart to pick up edits.', e.message);
  }
}
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => rebuild().catch(e => console.error(e)), 250);
}

// --- http ------------------------------------------------------------------------------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

const routes = {
  'GET /api/world': async (req, url) => {
    const as = url.searchParams.get('as');
    if (!as) return world;
    return redactWorld(world, await apertureFor(store, as));
  },
  'GET /api/levels': async () => LEVELS,
  'GET /api/membrane': async () => {
    const [membrane, postcards, beacons] = await Promise.all([store.membrane(), store.postcards(), store.beacons()]);
    return { membrane, postcards, beacons: beacons.slice(-20) };
  },
  'POST /api/membrane': async (req, url, body) => store.setAperture(need(body.agent, 'agent'), need(body.aperture, 'aperture'), body.note),
  'POST /api/name': async (req, url, body) => { await store.setName(need(body.id, 'id'), body.name?.trim()); await rebuild(); return { ok: true }; },
  'POST /api/beacon': async (req, url, body) => {
    const b = await store.addBeacon({ target: need(body.target, 'target'), message: String(body.message || '').slice(0, 500) });
    broadcast('membrane', {});
    return b;
  },
  'POST /api/postcards/dismiss': async (req, url, body) => { await store.dismissPostcard(need(body.id, 'id')); broadcast('membrane', {}); return { ok: true }; },
  'POST /api/capture': async (req, url, body) => {
    const text = need(String(body.text || '').trim(), 'text');
    const file = await capture(text, body.near);
    await rebuild();
    return { ok: true, id: file };
  },

  // ---- agent side of the membrane ----
  'GET /api/agent/view': async (req, url) => {
    const agent = need(url.searchParams.get('agent'), 'agent');
    const aperture = await apertureFor(store, agent);
    const view = redactWorld(world, aperture);
    const focus = url.searchParams.get('focus') || 'cosmos';
    const depth = Number(url.searchParams.get('depth') || 2);
    const visible = new Set(view.nodes.map(n => n.id));
    const postcards = (await store.postcards()).filter(p => visible.has(p.target));
    const beacons = visibleBeacons(world, await store.beacons(), aperture);
    if (url.searchParams.get('format') === 'json') return { ...view, postcards, beacons };
    return { text: renderOutline(view, { focus, depth, postcards, beacons }) };
  },
  'GET /api/agent/beacons': async (req, url) => {
    const aperture = await apertureFor(store, need(url.searchParams.get('agent'), 'agent'));
    return visibleBeacons(world, await store.beacons(), aperture);
  },
  'POST /api/agent/postcard': async (req, url, body) => {
    const agent = need(body.agent, 'agent');
    const aperture = await apertureFor(store, agent);
    if (!canAddress(world, need(body.target, 'target'), aperture)) {
      throw httpError(403, `"${body.target}" is beyond ${agent}'s aperture (${LEVELS[aperture].key}).`);
    }
    const card = await store.addPostcard({ agent, target: body.target, text: need(String(body.text || '').trim(), 'text').slice(0, 2000) });
    broadcast('membrane', {});
    return card;
  },
};

// A capture becomes its own little note in inbox/, linked to wherever you were zoomed,
// so clustering pulls it toward that neighbourhood. No filing decisions.
async function capture(text, nearId) {
  const index = new Map(world.nodes.map(n => [n.id, n]));
  let near = nearId && index.get(nearId);
  let anchorTitle = null;
  while (near && !anchorTitle) {
    if (near.level === 3) anchorTitle = near.label;
    else if (near.level === 4) near = index.get(near.parent);
    else if (near.level === 2 && near.anchor) anchorTitle = index.get(near.anchor)?.label;
    else if (near.level === 1) near = index.get(near.children[0]);
    else break;
  }
  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const first = text.split('\n')[0].slice(0, 60);
  const rel = `inbox/${stamp}-${slugify(first)}.md`;
  const md = `---\nupdated: ${now.toISOString()}\n---\n# ${first}\n\n${text}\n${anchorTitle ? `\nnear:: [[${anchorTitle}]]\n` : ''}`;
  await mkdir(join(CORPUS, 'inbox'), { recursive: true });
  await writeFile(join(CORPUS, rel), md);
  return rel.replace(/\.md$/, '');
}

function need(v, name) {
  if (v === undefined || v === null || v === '') throw httpError(400, `missing "${name}"`);
  return v;
}
function httpError(status, message) { return Object.assign(new Error(message), { status }); }

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 1e6) throw httpError(413, 'too large'); }
  return raw ? JSON.parse(raw) : {};
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/api/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
      res.write(': hello\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    const handler = routes[`${req.method} ${url.pathname}`];
    if (handler) {
      if (building) await building;
      const body = req.method === 'POST' ? await readBody(req) : {};
      const out = await handler(req, url, body);
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(out));
    }
    if (req.method === 'GET') {
      const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      if (!/^[\w.-]+$/.test(file)) throw httpError(404, 'not found');
      const data = await readFile(join(here, 'web', file)).catch(() => { throw httpError(404, 'not found'); });
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
      return res.end(data);
    }
    throw httpError(404, 'not found');
  } catch (e) {
    const status = e.status || (e instanceof SyntaxError ? 400 : 500);
    if (status === 500) console.error(e);
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  }
});

await rebuild();
watchCorpus();
server.listen(PORT, HOST, () => {
  console.log(`✶ Scales is open at http://${HOST}:${PORT}  (corpus: ${CORPUS})`);
});
