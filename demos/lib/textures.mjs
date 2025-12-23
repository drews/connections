/**
 * Texture/Character Vocabulary
 * Monochrome visual language using density and shape
 */

// Box styles by node type
const BoxStyles = {
  concept: {
    tl: '╭', tr: '╮', bl: '╰', br: '╯',
    h: '─', v: '│'
  },
  domain: {
    tl: '╔', tr: '╗', bl: '╚', br: '╝',
    h: '═', v: '║'
  },
  resource: {
    tl: '⟦', tr: '⟧', bl: '⟦', br: '⟧',
    h: ' ', v: ' '
  },
  // Fallback
  default: {
    tl: '┌', tr: '┐', bl: '└', br: '┘',
    h: '─', v: '│'
  }
};

// Edge characters by weight
const EdgeChars = {
  strong: '═',   // weight > 0.8
  medium: '─',   // weight 0.5-0.8
  weak: '╌',     // weight 0.3-0.5
  faint: '⋯'     // weight < 0.3
};

// Luminance/density characters
const Density = {
  focal: '█',
  high: '▓',
  medium: '▒',
  low: '░',
  faint: '·',
  empty: ' '
};

// Vertical connectors
const Connectors = {
  down: '│',
  up: '│',
  split: '┬',
  join: '┴',
  cross: '┼',
  arrow_down: '▼',
  arrow_up: '▲'
};

/**
 * Get box style for a node type
 */
function getBoxStyle(type) {
  return BoxStyles[type] || BoxStyles.default;
}

/**
 * Get edge character based on weight
 */
function getEdgeChar(weight) {
  if (weight > 0.8) return EdgeChars.strong;
  if (weight > 0.5) return EdgeChars.medium;
  if (weight > 0.3) return EdgeChars.weak;
  return EdgeChars.faint;
}

/**
 * Get density character based on distance from focus (0 = focal)
 */
function getDensityChar(distance) {
  if (distance === 0) return Density.focal;
  if (distance === 1) return Density.high;
  if (distance === 2) return Density.medium;
  if (distance === 3) return Density.low;
  return Density.faint;
}

/**
 * Draw a box around text
 */
function drawBox(text, type = 'concept', padX = 1, padY = 0) {
  const style = getBoxStyle(type);
  const width = text.length + (padX * 2);

  const top = style.tl + style.h.repeat(width) + style.tr;
  const bottom = style.bl + style.h.repeat(width) + style.br;

  const lines = [top];

  for (let i = 0; i < padY; i++) {
    lines.push(style.v + ' '.repeat(width) + style.v);
  }

  lines.push(style.v + ' '.repeat(padX) + text + ' '.repeat(padX) + style.v);

  for (let i = 0; i < padY; i++) {
    lines.push(style.v + ' '.repeat(width) + style.v);
  }

  lines.push(bottom);

  return lines;
}

/**
 * Draw a horizontal line with optional label
 */
function drawHLine(length, weight = 1, label = '') {
  const char = getEdgeChar(weight);
  if (!label) return char.repeat(length);

  const labelPos = Math.floor((length - label.length) / 2);
  const before = char.repeat(Math.max(0, labelPos));
  const after = char.repeat(Math.max(0, length - labelPos - label.length));
  return before + label + after;
}

/**
 * Create a text-based node representation
 */
function renderNode(node, options = {}) {
  const {
    isFocal = false,
    distance = 1,
    maxWidth = 20
  } = options;

  let label = node.label;
  if (label.length > maxWidth - 4) {
    label = label.substring(0, maxWidth - 7) + '...';
  }

  return {
    lines: drawBox(label, node.type),
    width: label.length + 4,
    height: 3,
    density: getDensityChar(isFocal ? 0 : distance)
  };
}

export {
  BoxStyles,
  EdgeChars,
  Density,
  Connectors,
  getBoxStyle,
  getEdgeChar,
  getDensityChar,
  drawBox,
  drawHLine,
  renderNode
};
