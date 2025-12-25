#!/usr/bin/env node
/**
 * Ambient Noise Field - Proof of Concept
 * Amp-style procedural animation with framebuffer diffing
 */

import { fbm, seed } from './lib/noise.mjs';
import { Framebuffer, ANSI } from './lib/framebuffer.mjs';

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

const CONFIG = {
  fps: 24,                    // Target frame rate
  noiseScale: 0.08,           // Spatial frequency (smaller = smoother)
  timeScale: 0.15,            // Temporal speed (smaller = slower drift)
  octaves: 3,                 // Noise complexity
  persistence: 0.5,           // Octave amplitude decay
  contrast: 0.6,              // Output contrast (0-1)
  brightness: 0.3,            // Base brightness offset

  // Mouse influence (Gaussian distribution)
  mouseRadius: 15,            // ~3σ of the Gaussian spread (chars)
  mouseStrength: 1.0,         // Peak influence at cursor center
};

// Character ramp from dark to bright
// Using density/texture for monochrome aesthetic
const CHAR_RAMP = ' .·:;░▒▓█';

// Color palette (256-color mode)
// Blues for ambient field: 17, 18, 19, 20, 21 (dark to bright blue)
const BLUE_RAMP = [17, 18, 19, 20, 21];
// Reds for mouse influence: 52, 88, 124, 160, 196 (dark to bright red)
const RED_RAMP = [52, 88, 124, 160, 196];

// ─────────────────────────────────────────────────────────────
// Noise → Character/Color Mapping
// ─────────────────────────────────────────────────────────────

function noiseToChar(value) {
  // value is in [-1, 1], normalize to [0, 1]
  let normalized = (value + 1) / 2;

  // Apply contrast curve
  normalized = Math.pow(normalized, 1 / CONFIG.contrast);

  // Add brightness offset
  normalized = Math.min(1, normalized * (1 - CONFIG.brightness) + CONFIG.brightness);

  // Map to character index
  const index = Math.floor(normalized * (CHAR_RAMP.length - 1));
  return CHAR_RAMP[Math.max(0, Math.min(CHAR_RAMP.length - 1, index))];
}

function noiseToColor(value, mouseInfluence = 0) {
  // value is in [-1, 1], normalize to [0, 1]
  let normalized = (value + 1) / 2;

  // Apply same contrast/brightness as char mapping
  normalized = Math.pow(normalized, 1 / CONFIG.contrast);
  normalized = Math.min(1, normalized * (1 - CONFIG.brightness) + CONFIG.brightness);

  // Map to color ramp index
  const index = Math.floor(normalized * (BLUE_RAMP.length - 1));
  const clampedIndex = Math.max(0, Math.min(BLUE_RAMP.length - 1, index));

  // Blend between blue and red based on mouse influence
  if (mouseInfluence > 0.01) {
    // Use red ramp when mouse is near
    return RED_RAMP[clampedIndex];
  } else {
    // Use blue ramp for ambient field
    return BLUE_RAMP[clampedIndex];
  }
}

// ─────────────────────────────────────────────────────────────
// Mouse Influence
// ─────────────────────────────────────────────────────────────

function getMouseInfluence(x, y, mouseX, mouseY) {
  if (mouseX < 0 || mouseY < 0) return 0;

  // Compensate for character aspect ratio (chars are ~2x taller than wide)
  const dx = x - mouseX;
  const dy = (y - mouseY) * 2;
  const distSquared = dx * dx + dy * dy;

  // Gaussian falloff: e^(-d²/(2σ²))
  // σ (sigma) controls the spread - using mouseRadius as ~3σ
  const sigma = CONFIG.mouseRadius / 3;
  const gaussian = Math.exp(-distSquared / (2 * sigma * sigma));

  return gaussian * CONFIG.mouseStrength;
}

// ─────────────────────────────────────────────────────────────
// Render Layers
// ─────────────────────────────────────────────────────────────

function renderNoiseField(fb, time, mouseX, mouseY) {
  const { width, height } = fb;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Sample noise at this position + time
      const nx = x * CONFIG.noiseScale;
      const ny = y * CONFIG.noiseScale * 2; // Compensate for char aspect ratio
      const nz = time * CONFIG.timeScale;

      let value = fbm(nx, ny, nz, CONFIG.octaves, CONFIG.persistence);

      // Calculate mouse influence (Gaussian-ish falloff)
      const mouseInfluence = getMouseInfluence(x, y, mouseX, mouseY);

      // Brighten near mouse
      if (mouseInfluence > 0) {
        const perturbation = fbm(nx * 2, ny * 2, nz * 3, 2, 0.5) * 0.3;
        value = value + mouseInfluence * (1 - value) + perturbation * mouseInfluence;
      }

      const char = noiseToChar(value);
      const color = noiseToColor(value, mouseInfluence);

      fb.set(x, y, char, color);
    }
  }
}

function renderOverlay(fb, time, fps, focusX, focusY, usingKeyboard, lastKey) {
  const { width, height } = fb;

  // Title bar
  const title = ' AMBIENT NOISE FIELD ';
  const titleX = Math.floor((width - title.length) / 2);
  fb.write(titleX, 1, title, 255); // Bright white

  // Controls hint
  const controls = usingKeyboard
    ? ' WASD/Arrows to move cursor '
    : ' Mouse detected ';
  const controlsX = Math.floor((width - controls.length) / 2);
  fb.write(controlsX, 2, controls, 245);

  // Debug panel - show input diagnostics
  const mouseStatus = fb.platform === 'win32'
    ? 'NO (Win32 Node.js bug)'
    : (fb.mouse.x >= 0 ? 'YES' : 'waiting...');

  const debugLines = [
    `platform: ${fb.platform}`,
    `raw mode: ${fb.rawModeEnabled ? 'YES' : 'NO'}`,
    `mouse support: ${mouseStatus}`,
    `input events: ${fb.inputCount}`,
    `last raw: ${(fb.lastRawInput || '(none)').slice(0, 20)}`,
    `cursor: x=${focusX} y=${focusY}`,
    `last key: ${lastKey || '(none)'}`,
  ];

  // Draw debug box in top-right
  const debugWidth = 34;
  const debugX = width - debugWidth - 2;
  fb.write(debugX, 1, '┌─ INPUT DEBUG ' + '─'.repeat(debugWidth - 15) + '┐', 245);
  for (let i = 0; i < debugLines.length; i++) {
    const line = debugLines[i].slice(0, debugWidth - 3).padEnd(debugWidth - 3);
    fb.write(debugX, 2 + i, '│ ' + line + '│', 245);
  }
  fb.write(debugX, 2 + debugLines.length, '└' + '─'.repeat(debugWidth - 1) + '┘', 245);

  // Draw cursor crosshair at focus position
  if (focusX >= 0 && focusX < width && focusY >= 0 && focusY < height) {
    fb.set(focusX, focusY, '+', 255);  // Bright white crosshair
  }

  // Status bar with position gauge
  const posInfo = `x:${String(focusX).padStart(3)} y:${String(focusY).padStart(3)}`;
  const status = ` ${fps.toFixed(1)} fps | ${posInfo} | Ctrl+C to exit `;
  const statusX = Math.floor((width - status.length) / 2);
  fb.write(statusX, height - 2, status, 250);

  // Center box (demo of layering)
  const boxWidth = 30;
  const boxHeight = 5;
  const boxX = Math.floor((width - boxWidth) / 2);
  const boxY = Math.floor((height - boxHeight) / 2);

  // Draw box border
  const top = '╭' + '─'.repeat(boxWidth - 2) + '╮';
  const mid = '│' + ' '.repeat(boxWidth - 2) + '│';
  const bot = '╰' + '─'.repeat(boxWidth - 2) + '╯';

  fb.write(boxX, boxY, top, 255);
  for (let i = 1; i < boxHeight - 1; i++) {
    fb.write(boxX, boxY + i, mid, 255);
  }
  fb.write(boxX, boxY + boxHeight - 1, bot, 255);

  // Box content
  const line1 = 'Procedural Noise Field';
  const line2 = 'Mouse-Reactive Ambient';
  fb.write(boxX + Math.floor((boxWidth - line1.length) / 2), boxY + 1, line1, 255);
  fb.write(boxX + Math.floor((boxWidth - line2.length) / 2), boxY + 2, line2, 250);

  // Breathing dot (shows ambient feel)
  const pulse = Math.sin(time * 2) * 0.5 + 0.5;
  const pulseChar = pulse > 0.7 ? '●' : pulse > 0.3 ? '◐' : '○';
  fb.write(boxX + Math.floor(boxWidth / 2), boxY + 3, pulseChar, 255);
}

// ─────────────────────────────────────────────────────────────
// Game Loop
// ─────────────────────────────────────────────────────────────

function run() {
  seed(Date.now());

  const fb = new Framebuffer();
  fb.enter();

  let running = true;
  let lastTime = Date.now();
  let frameCount = 0;
  let fpsDisplay = CONFIG.fps;
  let fpsTimer = 0;

  // Virtual cursor (keyboard-controlled)
  let cursorX = Math.floor(fb.width / 2);
  let cursorY = Math.floor(fb.height / 2);
  let lastKey = '';
  const cursorSpeed = 2;

  // Handle keyboard input
  fb.onKey((key) => {
    lastKey = key;
    switch (key) {
      case 'up':
        cursorY = Math.max(0, cursorY - cursorSpeed);
        break;
      case 'down':
        cursorY = Math.min(fb.height - 1, cursorY + cursorSpeed);
        break;
      case 'left':
        cursorX = Math.max(0, cursorX - cursorSpeed);
        break;
      case 'right':
        cursorX = Math.min(fb.width - 1, cursorX + cursorSpeed);
        break;
    }
  });

  // Graceful exit
  const cleanup = () => {
    running = false;
    fb.exit();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Main loop
  const frameInterval = 1000 / CONFIG.fps;

  function tick() {
    if (!running) return;

    const now = Date.now();
    const delta = now - lastTime;
    lastTime = now;

    // FPS calculation
    frameCount++;
    fpsTimer += delta;
    if (fpsTimer >= 1000) {
      fpsDisplay = frameCount / (fpsTimer / 1000);
      frameCount = 0;
      fpsTimer = 0;
    }

    // Animation time (in seconds)
    const time = now / 1000;

    // Use mouse if available, otherwise use keyboard cursor
    let focusX = fb.mouse.x >= 0 ? fb.mouse.x : cursorX;
    let focusY = fb.mouse.y >= 0 ? fb.mouse.y : cursorY;

    // Render layers
    renderNoiseField(fb, time, focusX, focusY);
    renderOverlay(fb, time, fpsDisplay, focusX, focusY, fb.mouse.x < 0, lastKey);

    // Flush changes
    fb.flush();

    // Schedule next frame
    const elapsed = Date.now() - now;
    const delay = Math.max(0, frameInterval - elapsed);
    setTimeout(tick, delay);
  }

  // Start the loop
  tick();
}

run();
