#!/usr/bin/env node
import React from 'react';
import { render, Box, Text, useApp, useStdout } from 'ink';

import { graphData, getNode, getChildren, getParents, getPeers } from './lib/knowledge-graph.mjs';
import { States, Timing, createStateMachine, getBreathScale } from './lib/animation.mjs';
import { getBoxStyle, getDensityChar } from './lib/textures.mjs';

const { useState, useEffect, createElement: h } = React;

const WIDTH = 60;

/**
 * Center a string within a given width
 */
function center(str, width) {
  const pad = Math.max(0, width - str.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

/**
 * Render a node as a compact box string
 */
function renderNodeBox(node, maxLen = 14) {
  const style = getBoxStyle(node.type);
  let label = node.label;
  if (label.length > maxLen) {
    label = label.substring(0, maxLen - 2) + '..';
  }
  const w = label.length + 2;
  const top = style.tl + style.h.repeat(w) + style.tr;
  const mid = style.v + ' ' + label + ' ' + style.v;
  const bot = style.bl + style.h.repeat(w) + style.br;
  return { top, mid, bot, width: w + 2 };
}

/**
 * Render multiple nodes side by side with spacing
 */
function renderNodesRow(nodes, totalWidth) {
  if (nodes.length === 0) {
    return ['', center('(none)', totalWidth), ''];
  }

  const boxes = nodes.map(({ node }) => renderNodeBox(node));
  const totalBoxWidth = boxes.reduce((sum, b) => sum + b.width, 0);
  const gaps = nodes.length + 1;
  const spacing = Math.max(1, Math.floor((totalWidth - totalBoxWidth) / gaps));

  let topLine = '';
  let midLine = '';
  let botLine = '';

  for (let i = 0; i < boxes.length; i++) {
    const sp = i === 0 ? ' '.repeat(spacing) : ' '.repeat(spacing);
    topLine += sp + boxes[i].top;
    midLine += sp + boxes[i].mid;
    botLine += sp + boxes[i].bot;
  }

  // Pad to totalWidth
  topLine = topLine.padEnd(totalWidth);
  midLine = midLine.padEnd(totalWidth);
  botLine = botLine.padEnd(totalWidth);

  return [topLine, midLine, botLine];
}

/**
 * Build System Frame - node as container
 */
function buildSystemFrame(focusNode, graph, breathScale) {
  const children = getChildren(graph, focusNode.id).slice(0, 3);
  const childCount = getChildren(graph, focusNode.id).length;
  const extraCount = childCount > 3 ? childCount - 3 : 0;

  const title = focusNode.label.length > 20
    ? focusNode.label.substring(0, 17) + '...'
    : focusNode.label;

  const innerW = WIDTH - 4;
  const nodeRows = renderNodesRow(children, innerW);

  const lines = [
    '╭' + '─'.repeat(WIDTH - 2) + '╮',
    '│' + center(`[ ${title} ]`, innerW) + '│',
    '│' + center('contains...', innerW) + '│',
    '│' + ' '.repeat(innerW) + '│',
    '│' + center('│', innerW) + '│',
    '│' + center('┌────────┼────────┐', innerW) + '│',
    '│' + center('▼        ▼        ▼', innerW) + '│',
    '│' + nodeRows[0] + '│',
    '│' + nodeRows[1] + '│',
    '│' + nodeRows[2] + '│',
    '│' + ' '.repeat(innerW) + '│',
  ];

  if (extraCount > 0) {
    lines.push('│' + center(`+ ${extraCount} more...`, innerW) + '│');
  } else {
    lines.push('│' + ' '.repeat(innerW) + '│');
  }

  lines.push('╰' + '─'.repeat(WIDTH - 2) + '╯');

  return lines;
}

/**
 * Build Component Frame - node in context
 */
function buildComponentFrame(focusNode, graph, breathScale) {
  const parents = getParents(graph, focusNode.id).slice(0, 3);
  const children = getChildren(graph, focusNode.id).slice(0, 3);

  const title = focusNode.label.length > 20
    ? focusNode.label.substring(0, 17) + '...'
    : focusNode.label;

  const innerW = WIDTH - 4;
  const parentRows = renderNodesRow(parents, innerW);
  const childRows = renderNodesRow(children, innerW);

  const lines = [
    '╭' + '─'.repeat(WIDTH - 2) + '╮',
    '│' + center('participates in...', innerW) + '│',
    '│' + ' '.repeat(innerW) + '│',
    '│' + parentRows[0] + '│',
    '│' + parentRows[1] + '│',
    '│' + parentRows[2] + '│',
    '│' + center('│        │        │', innerW) + '│',
    '│' + center('└────────┼────────┘', innerW) + '│',
    '│' + center('▼', innerW) + '│',
    '│' + center(`[ ${title} ]`, innerW) + '│',
    '│' + center('▼', innerW) + '│',
    '│' + center('┌────────┼────────┐', innerW) + '│',
    '│' + center('▼        ▼        ▼', innerW) + '│',
    '│' + childRows[0] + '│',
    '│' + childRows[1] + '│',
    '│' + childRows[2] + '│',
    '│' + ' '.repeat(innerW) + '│',
    '╰' + '─'.repeat(WIDTH - 2) + '╯',
  ];

  return lines;
}

/**
 * Build Transition Frame
 */
function buildTransitionFrame(focusNode, progress) {
  const title = focusNode.label.length > 20
    ? focusNode.label.substring(0, 17) + '...'
    : focusNode.label;

  const innerW = WIDTH - 4;
  const barLen = 30;
  const filled = Math.floor(progress * barLen);
  const bar = getDensityChar(0).repeat(filled) + getDensityChar(3).repeat(barLen - filled);

  const label = progress < 0.5 ? 'zooming out...' : 'zooming in...';

  const lines = [
    '╭' + '─'.repeat(WIDTH - 2) + '╮',
    '│' + ' '.repeat(innerW) + '│',
    '│' + ' '.repeat(innerW) + '│',
    '│' + center(`[ ${title} ]`, innerW) + '│',
    '│' + ' '.repeat(innerW) + '│',
    '│' + center(label, innerW) + '│',
    '│' + ' '.repeat(innerW) + '│',
    '│' + center(bar, innerW) + '│',
    '│' + ' '.repeat(innerW) + '│',
    '│' + ' '.repeat(innerW) + '│',
    '╰' + '─'.repeat(WIDTH - 2) + '╯',
  ];

  return lines;
}

/**
 * Main Demo App
 */
function SphereDemo() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [tick, setTick] = useState(0);
  const [machine] = useState(() => createStateMachine(graphData.demoSequence));

  const time = Date.now();
  const focusId = machine.getCurrentFocus();
  const focusNode = getNode(graphData, focusId);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      machine.update();
      setTick(t => t + 1);
    }, Timing.FRAME_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Handle exit
  useEffect(() => {
    const onExit = () => {
      exit();
      process.exit(0);
    };

    process.on('SIGINT', onExit);
    return () => process.off('SIGINT', onExit);
  }, [exit]);

  if (!focusNode) {
    return h(Text, null, 'Loading...');
  }

  const breathScale = getBreathScale(time, focusNode.phase || 0);
  const tweenProgress = machine.getTweenProgress();

  // Build the frame
  let frameLines;
  if (machine.state === States.IDLE_SYSTEM) {
    frameLines = buildSystemFrame(focusNode, graphData, breathScale);
  } else if (machine.state === States.IDLE_COMPONENT) {
    frameLines = buildComponentFrame(focusNode, graphData, breathScale);
  } else {
    frameLines = buildTransitionFrame(focusNode, tweenProgress);
  }

  const stateLabel = {
    [States.IDLE_SYSTEM]: 'system-frame',
    [States.TWEENING_TO_COMPONENT]: 'transitioning...',
    [States.IDLE_COMPONENT]: 'component-frame',
    [States.TWEENING_TO_SYSTEM]: 'transitioning...'
  }[machine.state];

  // Header
  const header = [
    '╔' + '═'.repeat(WIDTH - 2) + '╗',
    '║' + center('SPHERE OF INFLUENCE', WIDTH - 2) + '║',
    '║' + center('Knowledge Graph Demo', WIDTH - 2) + '║',
    '╚' + '═'.repeat(WIDTH - 2) + '╝',
  ];

  const footer = center(`${stateLabel} · ${focusNode.label} · Ctrl+C to exit`, WIDTH);

  return h(Box, { flexDirection: 'column', alignItems: 'center' },
    h(Text, null, ''),
    ...header.map((line, i) => h(Text, { key: `h${i}`, bold: true }, line)),
    h(Text, null, ''),
    ...frameLines.map((line, i) => h(Text, { key: `f${i}` }, line)),
    h(Text, null, ''),
    h(Text, { dimColor: true }, footer)
  );
}

// Run the demo
console.clear();
render(h(SphereDemo));
