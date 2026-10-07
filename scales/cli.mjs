#!/usr/bin/env node
// The agent side of the membrane, as a CLI. Works without the server running.
//
//   scales view      --agent claude [--focus <id>] [--depth 2] [--json]
//   scales beacons   --agent claude
//   scales postcard  --agent claude --target <id> "message"
//   scales membrane  [--agent <name> --aperture <level>]      (human: set apertures)
//   scales beacon    --target <id> ["message"]                (human: declare where you are)
//   scales levels
//
// SCALES_CORPUS selects the corpus folder (default: ./corpus).

import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWorld } from './core/world.mjs';
import { LEVELS, levelIndex } from './core/levels.mjs';
import {
  Store, apertureFor, redactWorld, visibleBeacons, canAddress, renderOutline, ago,
} from './core/membrane.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const CORPUS = resolve(process.env.SCALES_CORPUS || join(here, '..', 'corpus'));
const store = new Store(CORPUS);

const [cmd, ...rest] = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (a.startsWith('--')) {
    const k = a.slice(2);
    flags[k] = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true;
  } else positional.push(a);
}

const load = async () => buildWorld(CORPUS, { names: await store.names() });
const agentName = () => {
  if (!flags.agent) fail('pass --agent <name> (agents see the world through their own aperture)');
  return flags.agent;
};
function fail(msg) { console.error(`✗ ${msg}`); process.exit(1); }

const commands = {
  async view() {
    const agent = agentName();
    const aperture = await apertureFor(store, agent);
    const world = await load();
    const view = redactWorld(world, aperture);
    const visible = new Set(view.nodes.map(n => n.id));
    const postcards = (await store.postcards()).filter(p => visible.has(p.target));
    const beacons = visibleBeacons(world, await store.beacons(), aperture);
    if (flags.json) return console.log(JSON.stringify({ ...view, postcards, beacons }, null, 2));
    console.log(renderOutline(view, { focus: flags.focus || 'cosmos', depth: Number(flags.depth || 2), postcards, beacons }));
  },
  async beacons() {
    const aperture = await apertureFor(store, agentName());
    const bs = visibleBeacons(await load(), await store.beacons(), aperture);
    if (!bs.length) return console.log('No beacons. The human has not said where they are, and that is fine.');
    for (const b of bs.slice(-10).reverse()) console.log(`◉ ${ago(b.ts)} · ${b.level} "${b.label}"${b.blurred ? ' (blurred)' : ''}${b.message ? ` — ${b.message}` : ''}   {${b.target}}`);
  },
  async postcard() {
    const agent = agentName();
    const text = positional.join(' ').trim();
    if (!flags.target || !text) fail('usage: postcard --agent <name> --target <node id> "message"');
    const aperture = await apertureFor(store, agent);
    if (!canAddress(await load(), flags.target, aperture)) fail(`"${flags.target}" is beyond ${agent}'s aperture (${LEVELS[aperture].key}).`);
    const card = await store.addPostcard({ agent, target: flags.target, text });
    console.log(`✉ postcard ${card.id} pinned to ${flags.target}`);
  },
  async membrane() {
    if (flags.agent && flags.aperture) {
      levelIndex(flags.aperture);
      await store.setAperture(flags.agent, flags.aperture);
    }
    const m = await store.membrane();
    console.log(`default aperture: ${m.default}`);
    for (const [name, a] of Object.entries(m.agents)) {
      const L = LEVELS[levelIndex(a.aperture)];
      console.log(`  ${name.padEnd(12)} ${L.glyph} ${L.key.padEnd(13)} 10^${L.power}${a.note ? `   ${a.note}` : ''}`);
    }
  },
  async beacon() {
    if (!flags.target) fail('usage: beacon --target <node id> ["message"]');
    const world = await load();
    if (!world.nodes.some(n => n.id === flags.target)) fail(`no node "${flags.target}"`);
    await store.addBeacon({ target: flags.target, message: positional.join(' ') });
    console.log(`◉ beacon dropped at ${flags.target}`);
  },
  async levels() {
    for (const L of LEVELS) console.log(`${L.glyph}  10^${L.power}  ${L.title.padEnd(14)} ${L.flavor}`);
  },
};

if (!commands[cmd]) {
  console.log(`scales — navigate a corpus across powers of ten

  view      --agent <name> [--focus <id>] [--depth N] [--json]   see the world through an aperture
  beacons   --agent <name>                                      where the human says they are
  postcard  --agent <name> --target <id> "text"                 pin a note for the human
  membrane  [--agent <name> --aperture <level>]                 show / set apertures
  beacon    --target <id> ["text"]                              (human) declare where you are
  levels                                                        the five regimes

corpus: ${CORPUS}`);
  process.exit(cmd ? 1 : 0);
}
await commands[cmd]();
