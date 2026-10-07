// Tiny text utilities: tokenizing, TF-IDF, cosine similarity. No dependencies.

const STOP = new Set(`a about above after again against all also am an and any are as at be because been
before being below between both but by can could did do does doing down during each few for from further
had has have having he her here hers herself him himself his how i if in into is it its itself just let
like me more most my myself no nor not now of off on once only or other our ours ourselves out over own
same she should so some such than that the their theirs them themselves then there these they this those
through to too under until up very was we were what when where which while who whom why will with would
you your yours yourself yourselves into onto via per vs etc thing things way ways really maybe still
much many something someone one two three get gets got make makes made need needs want wants use used
using every even ever without within across around kind sort lot lots each well back go goes going new
note notes see seen also might must able feel feels felt word words yes okay`.split(/\s+/));

export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, ' $1 ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[`*_>#~\[\]()!|=:;"“”‘’.,?\/\\{}<>+]/g, ' ')
    .split(/[\s\-–—]+/)
    .map(w => w.replace(/^'+|'+$/g, '').replace(/'s$/, ''))
    .filter(w => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w));
}

// docs: array of token arrays. Returns { vectors: Map[], idf: Map }
export function tfidf(docs) {
  const df = new Map();
  for (const toks of docs) for (const t of new Set(toks)) df.set(t, (df.get(t) || 0) + 1);
  const n = docs.length;
  const idf = new Map();
  for (const [t, d] of df) idf.set(t, Math.log(1 + n / d));
  const vectors = docs.map(toks => {
    const tf = new Map();
    for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
    const v = new Map();
    let norm = 0;
    for (const [t, c] of tf) {
      const w = (1 + Math.log(c)) * idf.get(t);
      v.set(t, w);
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [t, w] of v) v.set(t, w / norm);
    return v;
  });
  return { vectors, idf };
}

export function cosine(a, b) {
  if (a.size > b.size) [a, b] = [b, a];
  let s = 0;
  for (const [t, w] of a) {
    const o = b.get(t);
    if (o) s += w * o;
  }
  return s;
}

// Top terms of a group of vectors, excluding any in `avoid`.
export function topTerms(vectors, k = 3, avoid = new Set()) {
  const sum = new Map();
  for (const v of vectors) for (const [t, w] of v) sum.set(t, (sum.get(t) || 0) + w);
  return [...sum.entries()]
    .filter(([t]) => !avoid.has(t))
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, k)
    .map(([t]) => t);
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'untitled';
}

// Small, stable, non-cryptographic hash (FNV-1a) for ids that should not reveal their input.
export function hashId(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}
