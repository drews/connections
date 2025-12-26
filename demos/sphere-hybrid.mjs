#!/usr/bin/env node
/**
 * Sphere of Influence - Hybrid Demo
 * Knowledge graph visualization on ambient noise field substrate
 *
 * Combines:
 * - Framebuffer direct rendering (no Ink)
 * - Procedural noise as living background
 * - System/component frame graph visualization
 * - Keyboard navigation between nodes
 */

import { fbm, seed } from './lib/noise.mjs';
import { Framebuffer } from './lib/framebuffer.mjs';
import * as KnowledgeGraph from './lib/knowledge-graph.mjs';
import * as AnimaliaGraph from './lib/animalia-graph.mjs';
import { getBoxStyle } from './lib/textures.mjs';
import { States, Timing, createStateMachine, getBreathScale } from './lib/animation.mjs';

// Available datasets
const DATASETS = {
  knowledge: { name: 'Systems Thinking', module: KnowledgeGraph },
  animalia: { name: 'Tree of Life', module: AnimaliaGraph },
};

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

const CONFIG = {
  fps: 20,

  // Noise field
  noiseScale: 0.06,
  timeScale: 0.1,
  octaves: 2,

  // Colors (256-color mode)
  bgDim: 17,        // Dark blue background
  bgBright: 20,     // Brighter blue near focus
  fgNode: 255,      // White for nodes
  fgDim: 245,       // Dim white for secondary
  fgAccent: 208,    // Orange for focus node

  // Focus influence
  focusRadius: 20,
  focusStrength: 0.6,
};

// Character ramp for noise field (subtle)
const NOISE_CHARS = ' ·.,:;';

// ─────────────────────────────────────────────────────────────
// Graph Layout Helpers
// ─────────────────────────────────────────────────────────────

function layoutNodes(nodes, centerX, centerY, radius) {
  const result = [];
  const count = nodes.length;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    result.push({
      ...nodes[i],
      x: Math.round(centerX + Math.cos(angle) * radius),
      y: Math.round(centerY + Math.sin(angle) * radius * 0.5), // Squash for char aspect
    });
  }

  return result;
}

function renderNodeBox(fb, x, y, label, type, color, maxLen = 16) {
  const style = getBoxStyle(type);

  if (label.length > maxLen) {
    label = label.substring(0, maxLen - 2) + '..';
  }

  const w = label.length + 2;
  const top = style.tl + style.h.repeat(w) + style.tr;
  const mid = style.v + ' ' + label + ' ' + style.v;
  const bot = style.bl + style.h.repeat(w) + style.br;

  const startX = x - Math.floor((w + 2) / 2);

  fb.write(startX, y - 1, top, color);
  fb.write(startX, y, mid, color);
  fb.write(startX, y + 1, bot, color);

  return { width: w + 2, height: 3 };
}

function renderEdge(fb, x1, y1, x2, y2, color) {
  // Simple vertical connector
  const midY = Math.round((y1 + y2) / 2);

  if (y1 < y2) {
    // Downward edge
    for (let y = y1 + 2; y < y2 - 1; y++) {
      fb.set(x1, y, '│', color);
    }
    fb.set(x1, y2 - 1, '▼', color);
  } else {
    // Upward edge
    for (let y = y2 + 2; y < y1 - 1; y++) {
      fb.set(x1, y, '│', color);
    }
    fb.set(x1, y1 - 1, '▲', color);
  }
}

// ─────────────────────────────────────────────────────────────
// Render Layers
// ─────────────────────────────────────────────────────────────

function renderNoiseBackground(fb, time, focusX, focusY) {
  const { width, height } = fb;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x * CONFIG.noiseScale;
      const ny = y * CONFIG.noiseScale * 2;
      const nz = time * CONFIG.timeScale;

      let value = fbm(nx, ny, nz, CONFIG.octaves, 0.5);

      // Focus influence - brighten near focus
      const dx = x - focusX;
      const dy = (y - focusY) * 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const focusInfluence = Math.exp(-(dist * dist) / (2 * CONFIG.focusRadius * CONFIG.focusRadius));

      value = value * 0.5 + 0.5; // Normalize to 0-1
      value = value + focusInfluence * CONFIG.focusStrength;

      const charIdx = Math.floor(value * (NOISE_CHARS.length - 1));
      const char = NOISE_CHARS[Math.max(0, Math.min(NOISE_CHARS.length - 1, charIdx))];

      // Color: blend from dim to bright based on focus
      const colorBlend = Math.min(1, focusInfluence * 2);
      const color = colorBlend > 0.5 ? CONFIG.bgBright : CONFIG.bgDim;

      fb.set(x, y, char, color);
    }
  }
}

function renderSystemFrame(fb, focusNode, graph, centerX, centerY, getChildren) {
  // System frame: focus node as container, showing children
  const children = getChildren(graph, focusNode.id).slice(0, 5);

  // Render focus node at top
  renderNodeBox(fb, centerX, centerY - 6, focusNode.label, focusNode.type, CONFIG.fgAccent);

  // Label
  fb.write(centerX - 6, centerY - 3, 'contains...', CONFIG.fgDim);

  // Connector lines
  fb.set(centerX, centerY - 2, '│', CONFIG.fgDim);
  fb.set(centerX, centerY - 1, '┬', CONFIG.fgDim);

  // Layout children in arc below
  if (children.length > 0) {
    const laid = layoutNodes(children, centerX, centerY + 3, 18);

    for (const child of laid) {
      // Draw connector
      fb.set(child.x, centerY, '│', CONFIG.fgDim);
      fb.set(child.x, centerY + 1, '▼', CONFIG.fgDim);

      // Draw node
      renderNodeBox(fb, child.x, child.y, child.node.label, child.node.type, CONFIG.fgNode, 12);
    }
  } else {
    fb.write(centerX - 4, centerY + 2, '(no children)', CONFIG.fgDim);
  }

  return { x: centerX, y: centerY - 6 }; // Return focus position for noise influence
}

function renderComponentFrame(fb, focusNode, graph, centerX, centerY, getChildren, getParents) {
  // Component frame: focus node in context, showing parents above and children below
  const parents = getParents(graph, focusNode.id).slice(0, 3);
  const children = getChildren(graph, focusNode.id).slice(0, 3);

  // Parents at top
  if (parents.length > 0) {
    fb.write(centerX - 7, centerY - 8, 'participates in...', CONFIG.fgDim);
    const laidParents = layoutNodes(parents, centerX, centerY - 5, 16);

    for (const parent of laidParents) {
      renderNodeBox(fb, parent.x, parent.y, parent.node.label, parent.node.type, CONFIG.fgDim, 10);
      fb.set(parent.x, parent.y + 2, '│', CONFIG.fgDim);
    }

    fb.set(centerX, centerY - 2, '┴', CONFIG.fgDim);
  }

  // Focus node in center
  fb.set(centerX, centerY - 1, '▼', CONFIG.fgDim);
  renderNodeBox(fb, centerX, centerY + 1, focusNode.label, focusNode.type, CONFIG.fgAccent);
  fb.set(centerX, centerY + 3, '▼', CONFIG.fgDim);

  // Children below
  if (children.length > 0) {
    fb.set(centerX, centerY + 4, '┬', CONFIG.fgDim);
    const laidChildren = layoutNodes(children, centerX, centerY + 7, 16);

    for (const child of laidChildren) {
      fb.set(child.x, centerY + 5, '│', CONFIG.fgDim);
      fb.set(child.x, centerY + 6, '▼', CONFIG.fgDim);
      renderNodeBox(fb, child.x, child.y, child.node.label, child.node.type, CONFIG.fgNode, 10);
    }
  }

  return { x: centerX, y: centerY + 1 }; // Return focus position
}

function renderTransition(fb, focusNode, progress, centerX, centerY) {
  // Simple transition overlay
  const label = progress < 0.5 ? 'zooming out...' : 'zooming in...';

  renderNodeBox(fb, centerX, centerY, focusNode.label, focusNode.type, CONFIG.fgAccent);
  fb.write(Math.floor(centerX - label.length / 2), centerY + 4, label, CONFIG.fgDim);

  // Progress bar
  const barWidth = 20;
  const filled = Math.floor(progress * barWidth);
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
  fb.write(Math.floor(centerX - barWidth / 2), centerY + 6, bar, CONFIG.fgDim);

  return { x: centerX, y: centerY };
}

function renderChrome(fb, machine, focusNode, fps, navHint, datasetName) {
  const { width, height } = fb;

  // Title with dataset name
  const title = `═══ SPHERE OF INFLUENCE: ${datasetName} ═══`;
  fb.write(Math.floor((width - title.length) / 2), 1, title, CONFIG.fgNode);

  // State indicator
  const stateLabels = {
    [States.IDLE_SYSTEM]: 'System Frame',
    [States.TWEENING_TO_COMPONENT]: 'Transitioning...',
    [States.IDLE_COMPONENT]: 'Component Frame',
    [States.TWEENING_TO_SYSTEM]: 'Transitioning...',
  };
  const state = stateLabels[machine.state] || '';
  fb.write(2, 1, state, CONFIG.fgDim);

  // Navigation hint
  fb.write(2, height - 2, navHint, CONFIG.fgDim);

  // Status bar
  const status = `${focusNode.label} | ${fps.toFixed(0)} fps | Space: toggle | ←→: navigate | Tab: dataset | Ctrl+C: exit`;
  fb.write(Math.floor((width - status.length) / 2), height - 1, status, CONFIG.fgDim);
}

// ─────────────────────────────────────────────────────────────
// Main Loop
// ─────────────────────────────────────────────────────────────

function run() {
  seed(Date.now());

  const fb = new Framebuffer();
  fb.enter();

  // Dataset management
  let currentDatasetKey = 'animalia';  // Default to Tree of Life
  let currentDataset = DATASETS[currentDatasetKey];
  let graphData = currentDataset.module.graphData;
  let getNode = currentDataset.module.getNode;
  let getChildren = currentDataset.module.getChildren;
  let getParents = currentDataset.module.getParents;

  const machine = createStateMachine(graphData.demoSequence);
  let autoAdvance = true;
  let manualFocusIndex = 0;

  // Dataset switching helper
  const switchDataset = () => {
    const keys = Object.keys(DATASETS);
    const currentIndex = keys.indexOf(currentDatasetKey);
    currentDatasetKey = keys[(currentIndex + 1) % keys.length];
    currentDataset = DATASETS[currentDatasetKey];
    graphData = currentDataset.module.graphData;
    getNode = currentDataset.module.getNode;
    getChildren = currentDataset.module.getChildren;
    getParents = currentDataset.module.getParents;

    // Reinitialize state machine with new dataset
    const newMachine = createStateMachine(graphData.demoSequence);
    machine.state = newMachine.state;
    machine.stateStartTime = newMachine.stateStartTime;
    machine.focusIndex = 0;
    machine.getCurrentFocus = newMachine.getCurrentFocus;
    machine.update = newMachine.update;
    machine.getTweenProgress = newMachine.getTweenProgress;
    manualFocusIndex = 0;
  };

  let running = true;
  let lastTime = Date.now();
  let frameCount = 0;
  let fpsDisplay = CONFIG.fps;
  let fpsTimer = 0;

  // Navigation hints based on mode
  const getNavHint = () => autoAdvance
    ? 'Auto-cycling (press Space to take control)'
    : 'Manual mode (←→ to navigate, Space for auto)';

  // Keyboard handling
  fb.onKey((key) => {
    if (key === 'space') {
      autoAdvance = !autoAdvance;
      if (!autoAdvance) {
        manualFocusIndex = machine.focusIndex;
      }
    } else if (key === 'tab') {
      switchDataset();
    } else if (!autoAdvance) {
      if (key === 'left') {
        manualFocusIndex = (manualFocusIndex - 1 + graphData.demoSequence.length) % graphData.demoSequence.length;
        machine.focusIndex = manualFocusIndex;
        machine.state = States.IDLE_SYSTEM;
        machine.stateStartTime = Date.now();
      } else if (key === 'right') {
        manualFocusIndex = (manualFocusIndex + 1) % graphData.demoSequence.length;
        machine.focusIndex = manualFocusIndex;
        machine.state = States.IDLE_SYSTEM;
        machine.stateStartTime = Date.now();
      } else if (key === 'up' || key === 'down') {
        // Toggle between system and component frame
        if (machine.state === States.IDLE_SYSTEM) {
          machine.state = States.IDLE_COMPONENT;
        } else if (machine.state === States.IDLE_COMPONENT) {
          machine.state = States.IDLE_SYSTEM;
        }
        machine.stateStartTime = Date.now();
      }
    }
  });

  const cleanup = () => {
    running = false;
    fb.exit();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  const frameInterval = 1000 / CONFIG.fps;

  function tick() {
    if (!running) return;

    const now = Date.now();
    const delta = now - lastTime;
    lastTime = now;

    // FPS calc
    frameCount++;
    fpsTimer += delta;
    if (fpsTimer >= 1000) {
      fpsDisplay = frameCount / (fpsTimer / 1000);
      frameCount = 0;
      fpsTimer = 0;
    }

    // Update state machine (only in auto mode)
    if (autoAdvance) {
      machine.update();
    }

    const time = now / 1000;
    const focusId = machine.getCurrentFocus();
    const focusNode = getNode(graphData, focusId);

    if (!focusNode) {
      setTimeout(tick, frameInterval);
      return;
    }

    const centerX = Math.floor(fb.width / 2);
    const centerY = Math.floor(fb.height / 2);

    // Determine focus position for noise influence
    let focusPos = { x: centerX, y: centerY };

    // Render layers
    // Layer 1: Noise background
    renderNoiseBackground(fb, time, focusPos.x, focusPos.y);

    // Layer 2: Graph visualization
    if (machine.state === States.IDLE_SYSTEM) {
      focusPos = renderSystemFrame(fb, focusNode, graphData, centerX, centerY, getChildren);
    } else if (machine.state === States.IDLE_COMPONENT) {
      focusPos = renderComponentFrame(fb, focusNode, graphData, centerX, centerY, getChildren, getParents);
    } else {
      focusPos = renderTransition(fb, focusNode, machine.getTweenProgress(), centerX, centerY);
    }

    // Layer 3: Chrome
    renderChrome(fb, machine, focusNode, fpsDisplay, getNavHint(), currentDataset.name);

    fb.flush();

    const elapsed = Date.now() - now;
    const delay = Math.max(0, frameInterval - elapsed);
    setTimeout(tick, delay);
  }

  tick();
}

run();
