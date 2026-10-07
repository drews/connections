// Greedy circle packing: biggest first, each new circle placed at the tangent
// position closest to the centre that overlaps nothing. Good enough for the
// tens-of-children-per-parent shape a knowledge corpus tends to have.

export function packCircles(circles, pad = 0) {
  const items = circles.map((c, idx) => ({ ...c, idx, r: c.r + pad }))
    .sort((a, b) => b.r - a.r || a.idx - b.idx);
  const placed = [];
  for (const c of items) {
    if (placed.length === 0) { c.x = 0; c.y = 0; }
    else if (placed.length === 1) { c.x = placed[0].r + c.r; c.y = 0; }
    else {
      let best = null;
      for (let a = 0; a < placed.length; a++) {
        for (let b = a + 1; b < placed.length; b++) {
          for (const p of tangentPoints(placed[a], placed[b], c.r)) {
            const d = p.x * p.x + p.y * p.y;
            if (best && d >= best.d) continue;
            if (!overlapsAny(p, c.r, placed)) best = { ...p, d };
          }
        }
      }
      if (!best) { // fall back: put it outside everything
        const R = Math.max(...placed.map(p => Math.hypot(p.x, p.y) + p.r));
        best = { x: R + c.r, y: 0 };
      }
      c.x = best.x; c.y = best.y;
    }
    placed.push(c);
  }
  // Enclose and re-centre.
  const enc = encloseApprox(placed);
  const out = new Array(circles.length);
  for (const c of placed) out[c.idx] = { x: c.x - enc.x, y: c.y - enc.y, r: c.r - pad };
  return { circles: out, r: enc.r };
}

function tangentPoints(a, b, r) {
  const ra = a.r + r, rb = b.r + r;
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  if (d > ra + rb || d < Math.abs(ra - rb) || d === 0) return [];
  const l = (ra * ra - rb * rb + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, ra * ra - l * l));
  const mx = a.x + (dx * l) / d, my = a.y + (dy * l) / d;
  return [
    { x: mx + (h * dy) / d, y: my - (h * dx) / d },
    { x: mx - (h * dy) / d, y: my + (h * dx) / d },
  ];
}

function overlapsAny(p, r, placed) {
  for (const q of placed) {
    const rr = r + q.r - 1e-6;
    const dx = p.x - q.x, dy = p.y - q.y;
    if (dx * dx + dy * dy < rr * rr) return true;
  }
  return false;
}

// Smallest-ish enclosing circle: try the bounding-box centre and the weighted
// centroid, keep whichever needs the smaller radius.
function encloseApprox(cs) {
  const cand = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, sx = 0, sy = 0, sw = 0;
  for (const c of cs) {
    minX = Math.min(minX, c.x - c.r); maxX = Math.max(maxX, c.x + c.r);
    minY = Math.min(minY, c.y - c.r); maxY = Math.max(maxY, c.y + c.r);
    const w = c.r * c.r; sx += c.x * w; sy += c.y * w; sw += w;
  }
  cand.push({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 }, { x: sx / sw, y: sy / sw });
  let best = null;
  for (const p of cand) {
    const r = Math.max(...cs.map(c => Math.hypot(c.x - p.x, c.y - p.y) + c.r));
    if (!best || r < best.r) best = { ...p, r };
  }
  return best;
}
