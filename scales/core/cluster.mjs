// Community detection (one-level Louvain local moving, deterministic) used twice:
// notes -> constellations, constellations -> territories.

// edges: Map<"i|j", weight> with i<j, n nodes. Returns community index per node (0..k-1).
export function louvain(n, edges, { resolution = 1, maxPasses = 20 } = {}) {
  const adj = Array.from({ length: n }, () => new Map());
  let m2 = 0;
  for (const [key, w] of edges) {
    const [i, j] = key.split('|').map(Number);
    adj[i].set(j, (adj[i].get(j) || 0) + w);
    adj[j].set(i, (adj[j].get(i) || 0) + w);
    m2 += 2 * w;
  }
  const comm = Array.from({ length: n }, (_, i) => i);
  if (m2 === 0) return renumber(comm);
  const k = adj.map(a => [...a.values()].reduce((s, w) => s + w, 0));
  const tot = k.slice();

  for (let pass = 0; pass < maxPasses; pass++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      if (k[i] === 0) continue;
      const ci = comm[i];
      const links = new Map();
      for (const [j, w] of adj[i]) if (j !== i) links.set(comm[j], (links.get(comm[j]) || 0) + w);
      tot[ci] -= k[i];
      let best = ci;
      let bestGain = (links.get(ci) || 0) - resolution * tot[ci] * k[i] / m2;
      for (const [c, w] of [...links.entries()].sort((a, b) => a[0] - b[0])) {
        const gain = w - resolution * tot[c] * k[i] / m2;
        if (gain > bestGain + 1e-12) { bestGain = gain; best = c; }
      }
      tot[best] += k[i];
      if (best !== ci) { comm[i] = best; moved = true; }
    }
    if (!moved) break;
  }
  return renumber(comm);
}

function renumber(comm) {
  const map = new Map();
  return comm.map(c => {
    if (!map.has(c)) map.set(c, map.size);
    return map.get(c);
  });
}

export function addEdge(edges, i, j, w) {
  if (i === j || w <= 0) return;
  const key = i < j ? `${i}|${j}` : `${j}|${i}`;
  edges.set(key, (edges.get(key) || 0) + w);
}

// Collapse a node graph into a community graph.
export function aggregate(edges, comm) {
  const out = new Map();
  for (const [key, w] of edges) {
    const [i, j] = key.split('|').map(Number);
    if (comm[i] !== comm[j]) addEdge(out, comm[i], comm[j], w);
  }
  return out;
}
