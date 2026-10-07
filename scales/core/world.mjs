// Builds a "world": one nested tree spanning five powers of ten
//   cosmos ⊃ territories ⊃ constellations ⊃ notes ⊃ sparks
// with a circle-packed layout so a camera can zoom continuously through it.

import { basename } from 'node:path';
import { readCorpus } from './parse.mjs';
import { tokenize, tfidf, cosine, topTerms, hashId } from './text.mjs';
import { louvain, addEdge, aggregate } from './cluster.mjs';
import { packCircles } from './pack.mjs';
import { LEVEL } from './levels.mjs';

export async function buildWorld(corpusDir, opts = {}) {
  const notes = await readCorpus(corpusDir);
  return buildWorldFromNotes(notes, { title: basename(corpusDir), ...opts });
}

export function buildWorldFromNotes(notes, { names = {}, title = 'cosmos', now = Date.now() } = {}) {
  notes = [...notes].sort((a, b) => (a.id < b.id ? -1 : 1));
  const n = notes.length;
  const { vectors } = tfidf(notes.map(nt => tokenize([nt.title, nt.title, nt.tags.join(' '), nt.body].join('\n'))));

  // --- the note graph -------------------------------------------------------
  const byKey = new Map();
  notes.forEach((nt, i) => {
    for (const k of [nt.id, basename(nt.id), nt.title]) byKey.set(k.toLowerCase(), i);
  });
  const edges = new Map();
  const links = [];
  notes.forEach((nt, i) => {
    for (const l of nt.links) {
      const j = byKey.get(l.toLowerCase()) ?? byKey.get(basename(l).toLowerCase());
      if (j === undefined || j === i) continue;
      addEdge(edges, i, j, 3);
      links.push([i, j]);
    }
  });
  const tagMembers = new Map();
  notes.forEach((nt, i) => nt.tags.forEach(t => (tagMembers.get(t) || tagMembers.set(t, []).get(t)).push(i)));
  for (const members of tagMembers.values()) {
    if (members.length < 2 || members.length > Math.max(8, n * 0.2)) continue; // ubiquitous tags say little
    for (let a = 0; a < members.length; a++)
      for (let b = a + 1; b < members.length; b++) addEdge(edges, members[a], members[b], 0.8);
  }
  for (let i = 0; i < n; i++) {
    const sims = [];
    for (let j = 0; j < n; j++) if (j !== i) sims.push([j, cosine(vectors[i], vectors[j])]);
    sims.sort((a, b) => b[1] - a[1]);
    for (const [j, s] of sims.slice(0, 4)) if (s > 0.06) addEdge(edges, i, j, s * 4);
  }

  // --- two tiers of communities ------------------------------------------------
  const noteComm = louvain(n, edges, { resolution: 1.4 });
  const nc = Math.max(0, ...noteComm) + 1;
  const consGraph = aggregate(edges, noteComm);
  let consComm = louvain(nc, consGraph, { resolution: 1.0 });

  // Lone wanderers (a single-note constellation that formed its own territory)
  // gather into one Frontier territory instead of each claiming a continent.
  const consSize = countBy(noteComm, nc);
  const terrCons = groupBy(consComm);
  const loners = [...terrCons.entries()].filter(([, cs]) => cs.length === 1 && consSize[cs[0]] === 1).map(([t]) => t);
  if (loners.length >= 2) {
    const frontier = loners[0];
    consComm = consComm.map(t => (loners.includes(t) ? frontier : t));
  }

  // --- assemble the tree ---------------------------------------------------------
  const degree = new Array(n).fill(0);
  for (const [key, w] of edges) {
    const [i, j] = key.split('|').map(Number);
    if (noteComm[i] === noteComm[j]) { degree[i] += w; degree[j] += w; }
  }
  const publicVecs = idx => idx.filter(i => !notes[i].private).map(i => vectors[i]);

  const root = { id: 'cosmos', level: LEVEL.cosmos, label: title, children: [] };
  const territories = groupBy(consComm.map((t, c) => t));
  const territoryKeys = [...territories.keys()].sort((a, b) => a - b);
  const frontierKey = loners.length >= 2 ? loners[0] : -1;

  for (const t of territoryKeys) {
    const consIdx = territories.get(t);
    const terr = { level: LEVEL.territory, children: [] };
    for (const c of consIdx) {
      const members = noteComm.map((cc, i) => (cc === c ? i : -1)).filter(i => i >= 0);
      const anchor = pickAnchor(members, notes, degree);
      const cons = {
        id: `c:${anchor.private ? hashId(anchor.id) : anchor.id}`,
        level: LEVEL.constellation,
        anchor: anchor.private ? null : anchor.id,
        label: anchor.private ? '◌ unnamed' : anchor.title,
        children: members.map(i => noteNode(notes[i])),
        terms: topTerms(publicVecs(members), 4),
      };
      terr.children.push(cons);
    }
    const allNotes = consIdx.flatMap(c => noteComm.map((cc, i) => (cc === c ? i : -1)).filter(i => i >= 0));
    const biggest = [...terr.children].sort((a, b) => b.children.length - a.children.length)[0];
    terr.id = t === frontierKey ? 't:frontier' : `t:${biggest.anchor || hashId(biggest.id)}`;
    terr.terms = topTerms(publicVecs(allNotes), 5);
    const label = distinctiveTags(allNotes.filter(i => !notes[i].private), notes, tagMembers);
    terr.label = t === frontierKey ? 'Frontier' : (label.length ? label : terr.terms.slice(0, 2)).join(' · ') || '◌';
    root.children.push(terr);
  }

  // Names chosen by you (or proposed by agents and accepted) win over generated ones.
  walk(root, node => {
    if (names[node.id]) { node.label = names[node.id]; node.named = true; }
  });

  // --- summaries bubble up -------------------------------------------------------
  walk(root, () => {}, node => {
    if (node.level === LEVEL.spark) return;
    if (node.level !== LEVEL.note) {
      node.notes = node.children.reduce((s, c) => s + c.notes, 0);
      node.sparks = node.children.reduce((s, c) => s + c.sparks, 0);
      node.updated = Math.max(0, ...node.children.map(c => c.updated));
      node.private = node.children.every(c => c.private);
    }
  });

  layout(root);

  // --- flatten ---------------------------------------------------------------------
  const nodes = [];
  walk(root, (node, parent) => {
    const { children, ...rest } = node;
    nodes.push({ ...rest, parent: parent ? parent.id : null, children: children ? children.map(c => c.id) : [] });
  });
  const linkEdges = dedupe(links.map(([i, j]) => [notes[i].id, notes[j].id]));

  return {
    title,
    builtAt: now,
    counts: {
      territories: root.children.length,
      constellations: nodes.filter(x => x.level === LEVEL.constellation).length,
      notes: n,
      sparks: nodes.filter(x => x.level === LEVEL.spark).length,
    },
    nodes,
    links: linkEdges,
  };
}

function noteNode(nt) {
  return {
    id: nt.id,
    level: LEVEL.note,
    label: nt.title,
    tags: nt.tags,
    private: nt.private,
    updated: nt.updated,
    notes: 1,
    sparks: nt.sparks.length,
    children: nt.sparks.map(s => ({
      id: s.id, level: LEVEL.spark, label: firstLine(s.text), text: s.text,
      private: nt.private, updated: nt.updated, notes: 0, sparks: 1,
    })),
  };
}

// Tags that are frequent here and rare elsewhere make the most legible continent names.
function distinctiveTags(members, notes, tagMembers) {
  const here = new Map();
  for (const i of members) for (const t of notes[i].tags) here.set(t, (here.get(t) || 0) + 1);
  return [...here.entries()]
    .filter(([, c]) => c >= 2)
    .map(([t, c]) => [t, (c * c) / tagMembers.get(t).length])
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, 2)
    .map(([t]) => t);
}

function pickAnchor(members, notes, degree) {
  const ranked = [...members].sort((a, b) =>
    (notes[a].private - notes[b].private) || (degree[b] - degree[a]) || (notes[b].sparks.length - notes[a].sparks.length) || (notes[a].id < notes[b].id ? -1 : 1));
  return notes[ranked[0]];
}

// Bottom-up packing in local coordinates, then top-down to absolute.
function layout(root) {
  walk(root, () => {}, node => {
    if (node.level === LEVEL.spark) { node.r = 2 + Math.sqrt(node.text.length) * 0.5; return; }
    if (!node.children.length) { node.r = 4; return; }
    const mean = node.children.reduce((s, c) => s + c.r, 0) / node.children.length;
    const pad = mean * (node.level === LEVEL.note ? 0.08 : 0.14);
    const packed = packCircles(node.children.map(c => ({ r: c.r })), pad);
    node.children.forEach((c, i) => { c.lx = packed.circles[i].x; c.ly = packed.circles[i].y; });
    node.r = packed.r * (node.level === LEVEL.note ? 1.18 : 1.1) + pad;
  });
  root.x = 0; root.y = 0;
  walk(root, (node, parent) => {
    if (!parent) return;
    node.x = parent.x + node.lx; node.y = parent.y + node.ly;
    delete node.lx; delete node.ly;
  });
}

export function walk(node, pre, post, parent = null) {
  pre && pre(node, parent);
  if (node.children) for (const c of node.children) walk(c, pre, post, node);
  post && post(node, parent);
}

function groupBy(arr) {
  const m = new Map();
  arr.forEach((k, i) => (m.get(k) || m.set(k, []).get(k)).push(i));
  return m;
}
function countBy(arr, k) {
  const c = new Array(k).fill(0);
  for (const x of arr) c[x]++;
  return c;
}
function dedupe(pairs) {
  const seen = new Set();
  return pairs.filter(([a, b]) => {
    const k = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
const firstLine = t => t.split('\n').find(l => l.trim())?.replace(/^#+\s*|^[-*+]\s+|^\d+[.)]\s+/g, '').slice(0, 80) || '';
