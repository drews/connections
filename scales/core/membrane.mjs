// The membrane: a two-way, scale-based consent layer between you and your agents.
//
//  - Each agent has an APERTURE: the finest level it may resolve. Everything below
//    that level reaches it only as counts. Abstraction is the privacy mechanism.
//  - Private notes are never resolved below constellation, whatever the aperture.
//  - You talk to agents with BEACONS ("I'm around here"); a beacon is blurred up
//    to whatever the agent is allowed to see. No keystroke logs, no activity feed.
//  - Agents talk back with POSTCARDS pinned to nodes they can see. You read them at
//    whatever scale you're inhabiting: zoomed out, they collapse into counts.

import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { LEVELS, LEVEL, levelIndex } from './levels.mjs';
import { hashId } from './text.mjs';

const DEFAULT_MEMBRANE = {
  default: 'territory',
  agents: {
    claude: { aperture: 'constellation', note: 'Coding sidekick. Sees shapes and names, not your prose.' },
    curator: { aperture: 'territory', note: 'Background gardener. Proposes names and merges.' },
  },
};

export class Store {
  constructor(corpusDir) {
    this.dir = join(corpusDir, '.scales');
  }
  path(f) { return join(this.dir, f); }

  async readJSON(f, fallback) {
    try { return JSON.parse(await readFile(this.path(f), 'utf8')); } catch { return structuredClone(fallback); }
  }
  async writeJSON(f, data) {
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.path(f), JSON.stringify(data, null, 2) + '\n');
  }
  async readLines(f) {
    try {
      return (await readFile(this.path(f), 'utf8')).split('\n').filter(Boolean).map(l => JSON.parse(l));
    } catch { return []; }
  }
  async appendLine(f, obj) {
    await mkdir(this.dir, { recursive: true });
    await appendFile(this.path(f), JSON.stringify(obj) + '\n');
  }

  names() { return this.readJSON('names.json', {}); }
  async setName(id, name) {
    const names = await this.names();
    if (name) names[id] = name; else delete names[id];
    await this.writeJSON('names.json', names);
    return names;
  }

  membrane() { return this.readJSON('membrane.json', DEFAULT_MEMBRANE); }
  async setAperture(agent, aperture, note) {
    const m = await this.membrane();
    levelIndex(aperture);
    m.agents[agent] = { ...(m.agents[agent] || {}), aperture };
    if (note !== undefined) m.agents[agent].note = note;
    await this.writeJSON('membrane.json', m);
    return m;
  }

  // Postcards: append-only log; a dismissal is just another line.
  async postcards() {
    const lines = await this.readLines('postcards.jsonl');
    const dismissed = new Set(lines.filter(l => l.dismiss).map(l => l.dismiss));
    return lines.filter(l => !l.dismiss && !dismissed.has(l.id));
  }
  async addPostcard(p) {
    const card = { id: `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, ts: Date.now(), ...p };
    await this.appendLine('postcards.jsonl', card);
    return card;
  }
  dismissPostcard(id) { return this.appendLine('postcards.jsonl', { dismiss: id, ts: Date.now() }); }

  async beacons() { return this.readLines('beacons.jsonl'); }
  async addBeacon(b) {
    const beacon = { id: `b_${Date.now().toString(36)}`, ts: Date.now(), ...b };
    await this.appendLine('beacons.jsonl', beacon);
    return beacon;
  }
}

export async function apertureFor(store, agent) {
  const m = await store.membrane();
  const a = m.agents[agent]?.aperture ?? m.default ?? 'territory';
  return levelIndex(a);
}

// Finest level a given node may be resolved at, for an agent with `aperture`.
const PRIVATE_CEILING = LEVEL.constellation;
function ceilingFor(node, aperture) {
  return node.private ? Math.min(aperture, PRIVATE_CEILING) : aperture;
}

// Returns a copy of the world as the agent is allowed to perceive it.
// Nodes finer than the agent's aperture vanish; their parent keeps only counts
// (`veiled`). Private notes keep their geometry but lose their names and ids.
export function redactWorld(world, aperture) {
  const index = new Map(world.nodes.map(n => [n.id, n]));
  const visible = new Map();
  const alias = new Map();
  const keep = (node, parentId) => {
    const ceiling = ceilingFor(node, aperture);
    if (node.level > ceiling) return false;
    const masked = node.private && node.level >= LEVEL.note;
    const id = masked ? `private:${hashId(node.id)}` : node.id;
    alias.set(node.id, id);
    const out = {
      id, level: node.level, parent: parentId, x: node.x, y: node.y, r: node.r,
      label: masked ? '◌ private' : node.label,
      notes: node.notes, sparks: node.sparks, updated: node.updated, private: node.private,
      children: [],
    };
    if (node.terms && !node.private) out.terms = node.terms;
    if (node.named) out.named = true;
    if (!masked && node.tags) out.tags = node.tags;
    if (!masked && node.text) out.text = node.text;
    visible.set(id, out);
    let veiled = 0;
    for (const cid of node.children) {
      const child = index.get(cid);
      if (keep(child, id)) out.children.push(alias.get(cid));
      else veiled++;
    }
    if (veiled) out.veiled = { count: veiled, level: LEVELS[node.level + 1].key };
    return true;
  };
  keep(index.get('cosmos'), null);
  const links = world.links
    .filter(([a, b]) => visible.has(alias.get(a)) && visible.has(alias.get(b)))
    .filter(([a, b]) => !index.get(a).private && !index.get(b).private);
  return { ...world, aperture: LEVELS[aperture].key, nodes: [...visible.values()], links, counts: world.counts };
}

// Raise a target to the finest ancestor the agent may see.
export function clampTarget(world, targetId, aperture) {
  const index = new Map(world.nodes.map(n => [n.id, n]));
  let node = index.get(targetId);
  while (node && node.level > ceilingFor(node, aperture)) node = index.get(node.parent);
  if (!node) return null;
  if (node.private && node.level >= LEVEL.note) return null;
  return node;
}

export function visibleBeacons(world, beacons, aperture) {
  return beacons.map(b => {
    const node = clampTarget(world, b.target, aperture);
    if (!node) return null;
    return {
      ts: b.ts, message: b.message || '',
      target: node.id, level: LEVELS[node.level].key, label: node.label,
      blurred: node.id !== b.target,
    };
  }).filter(Boolean);
}

// Can this agent pin a postcard to this node?
export function canAddress(world, targetId, aperture) {
  const node = world.nodes.find(n => n.id === targetId);
  return !!node && node.level <= ceilingFor(node, aperture) && !(node.private && node.level >= LEVEL.note);
}

// --- text rendering for agents -------------------------------------------------------

export function renderOutline(view, { focus = 'cosmos', depth = 2, postcards = [], beacons = [], now = Date.now() } = {}) {
  const index = new Map(view.nodes.map(n => [n.id, n]));
  const start = index.get(focus);
  if (!start) throw new Error(`Node "${focus}" is not visible at aperture ${view.aperture}.`);
  const cardsAt = new Map();
  for (const p of postcards) cardsAt.set(p.target, (cardsAt.get(p.target) || 0) + 1);
  const lines = [];
  const L = LEVELS[start.level];
  lines.push(`${L.glyph} ${L.title.toUpperCase()} 10^${L.power} — ${start.label}`);
  lines.push(`  aperture: ${view.aperture} (10^${LEVELS[LEVEL[view.aperture]].power}) · ${start.notes} notes · ${start.sparks} sparks · updated ${ago(start.updated, now)}`);
  if (start.terms?.length) lines.push(`  terms: ${start.terms.join(', ')}`);
  if (start.text) lines.push('', indent(start.text, '  │ '));
  const rec = (node, prefix, d) => {
    const kids = node.children.map(id => index.get(id));
    kids.forEach((k, i) => {
      const last = i === kids.length - 1;
      const lv = LEVELS[k.level];
      const meta = k.level === LEVEL.spark
        ? ''
        : ` — ${k.notes} note${k.notes === 1 ? '' : 's'}, ${ago(k.updated, now)}`;
      const cards = cardsAt.get(k.id) ? `  ✉${cardsAt.get(k.id)}` : '';
      const veil = k.veiled ? `  [${k.veiled.count} ${k.veiled.level}s beyond aperture]` : '';
      const label = k.level === LEVEL.spark ? JSON.stringify(k.label) : k.label;
      lines.push(`${prefix}${last ? '└─' : '├─'} ${lv.glyph} ${label}${meta}${cards}${veil}   {${k.id}}`);
      if (d > 1) rec(k, prefix + (last ? '   ' : '│  '), d - 1);
    });
  };
  rec(start, '  ', depth);
  if (start.veiled) lines.push(`  (${start.veiled.count} ${start.veiled.level}s here are beyond this aperture)`);
  if (beacons.length) {
    lines.push('', 'BEACONS (where the human says they are; blurred to your aperture)');
    for (const b of beacons.slice(-5).reverse()) {
      lines.push(`  ◉ ${ago(b.ts, now)} · ${b.level} "${b.label}"${b.blurred ? ' (blurred)' : ''}${b.message ? ` — ${b.message}` : ''}   {${b.target}}`);
    }
  }
  return lines.join('\n');
}

function indent(t, p) { return t.split('\n').map(l => p + l).join('\n'); }

export function ago(ts, now = Date.now()) {
  if (!ts) return 'never';
  const s = Math.max(0, (now - ts) / 1000);
  if (s < 90) return 'just now';
  if (s < 5400) return `${Math.round(s / 60)}m ago`;
  if (s < 129600) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 60) return `${Math.round(s / 86400)}d ago`;
  return `${Math.round(s / (86400 * 30))}mo ago`;
}
