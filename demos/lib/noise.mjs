/**
 * Simplified OpenSimplex-style 3D Noise
 * Based on simplex noise principles - good enough for ambient animation
 */

// Permutation table (256 values, doubled for overflow)
const perm = new Uint8Array(512);
const gradients3D = [
  [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0],
  [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1],
  [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]
];

// Initialize with seed
function seed(s = 0) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;

  // Fisher-Yates shuffle with seed
  for (let i = 255; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }

  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
  }
}

// Initialize with default seed
seed(42);

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

function grad3D(hash, x, y, z) {
  const g = gradients3D[hash % 12];
  return g[0] * x + g[1] * y + g[2] * z;
}

/**
 * 3D Perlin-style noise
 * Returns value in range [-1, 1]
 */
function noise3D(x, y, z) {
  // Find unit cube containing point
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;

  // Find relative position in cube
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);

  // Compute fade curves
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);

  // Hash coordinates of cube corners
  const A  = perm[X] + Y;
  const AA = perm[A] + Z;
  const AB = perm[A + 1] + Z;
  const B  = perm[X + 1] + Y;
  const BA = perm[B] + Z;
  const BB = perm[B + 1] + Z;

  // Blend corners
  return lerp(
    lerp(
      lerp(grad3D(perm[AA], x, y, z), grad3D(perm[BA], x - 1, y, z), u),
      lerp(grad3D(perm[AB], x, y - 1, z), grad3D(perm[BB], x - 1, y - 1, z), u),
      v
    ),
    lerp(
      lerp(grad3D(perm[AA + 1], x, y, z - 1), grad3D(perm[BA + 1], x - 1, y, z - 1), u),
      lerp(grad3D(perm[AB + 1], x, y - 1, z - 1), grad3D(perm[BB + 1], x - 1, y - 1, z - 1), u),
      v
    ),
    w
  );
}

/**
 * Fractal Brownian Motion - layered noise for more organic feel
 * octaves: number of layers
 * persistence: amplitude decay per octave
 */
function fbm(x, y, z, octaves = 4, persistence = 0.5) {
  let total = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}

export { seed, noise3D, fbm };
