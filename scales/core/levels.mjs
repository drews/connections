// The five regimes of a Scales world, from widest to finest.
// Like Spore's stages: each regime is its own way of inhabiting the same world.

export const LEVELS = [
  {
    key: 'cosmos', power: 4, glyph: '◎', title: 'Cosmos',
    flavor: 'Your whole corpus as a sky. Look for drift, not detail.',
  },
  {
    key: 'territory', power: 3, glyph: '◍', title: 'Territory',
    flavor: 'Continents of attention. Decide which ones are awake.',
  },
  {
    key: 'constellation', power: 2, glyph: '✶', title: 'Constellation',
    flavor: 'Notes that keep finding each other. Name what they are becoming.',
  },
  {
    key: 'note', power: 1, glyph: '◆', title: 'Note',
    flavor: 'A single creature of thought. Read it, link it, feed it.',
  },
  {
    key: 'spark', power: 0, glyph: '·', title: 'Spark',
    flavor: 'One paragraph, one bullet, one cell. Pure signal.',
  },
];

export const LEVEL = Object.fromEntries(LEVELS.map((l, i) => [l.key, i]));

export function levelIndex(keyOrIndex) {
  if (typeof keyOrIndex === 'number') return keyOrIndex;
  const i = LEVEL[String(keyOrIndex).toLowerCase()];
  if (i === undefined) throw new Error(`Unknown level "${keyOrIndex}". Use one of: ${LEVELS.map(l => l.key).join(', ')}`);
  return i;
}
