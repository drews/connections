/**
 * Framebuffer with Cell Diffing
 * Treats terminal as a pixel buffer, only updates changed cells
 */

// ANSI escape sequences
const ESC = '\x1b';
const CSI = `${ESC}[`;

const ANSI = {
  // Screen control
  altBufferOn: `${CSI}?1049h`,
  altBufferOff: `${CSI}?1049l`,
  clear: `${CSI}2J`,

  // Cursor control
  hideCursor: `${CSI}?25l`,
  showCursor: `${CSI}?25h`,
  moveTo: (row, col) => `${CSI}${row};${col}H`,

  // Mouse tracking
  mouseTrackOn: `${CSI}?1003h${CSI}?1006h`,  // Any-event + SGR extended mode
  mouseTrackOff: `${CSI}?1003l${CSI}?1006l`,

  // Colors (256-color mode)
  fg: (code) => `${CSI}38;5;${code}m`,
  bg: (code) => `${CSI}48;5;${code}m`,
  reset: `${CSI}0m`,

  // Grayscale helpers (232-255 are grayscale in 256-color)
  gray: (level) => {
    // level 0-23 maps to colors 232-255
    const code = 232 + Math.max(0, Math.min(23, Math.floor(level)));
    return `${CSI}38;5;${code}m`;
  }
};

/**
 * Cell represents a single character position
 */
class Cell {
  constructor(char = ' ', fg = null, bg = null) {
    this.char = char;
    this.fg = fg;    // 256-color code or null
    this.bg = bg;
  }

  equals(other) {
    return this.char === other.char &&
           this.fg === other.fg &&
           this.bg === other.bg;
  }

  clone() {
    return new Cell(this.char, this.fg, this.bg);
  }
}

/**
 * Framebuffer manages double-buffered terminal rendering
 */
class Framebuffer {
  constructor() {
    this.width = process.stdout.columns || 80;
    this.height = process.stdout.rows || 24;

    // Double buffer
    this.front = this.createBuffer();
    this.back = this.createBuffer();

    // Track if we're in alternate buffer
    this.active = false;

    // Mouse state
    this.mouse = { x: -1, y: -1, buttons: 0 };
    this.mouseListeners = [];

    // Keyboard state
    this.keys = new Set();
    this.keyListeners = [];
  }

  createBuffer() {
    const buffer = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(new Cell());
      }
      buffer.push(row);
    }
    return buffer;
  }

  /**
   * Enter alternate screen buffer and hide cursor
   */
  enter() {
    process.stdout.write(ANSI.altBufferOn + ANSI.hideCursor + ANSI.clear + ANSI.mouseTrackOn);
    this.active = true;

    // Handle resize
    process.stdout.on('resize', () => this.handleResize());

    // Enable raw mode for mouse input
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('data', (data) => this.parseInput(data));
  }

  /**
   * Exit alternate buffer and restore cursor
   */
  exit() {
    process.stdout.write(ANSI.mouseTrackOff + ANSI.reset + ANSI.showCursor + ANSI.altBufferOff);
    this.active = false;
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }
  }

  /**
   * Parse input for mouse events and keypresses
   * SGR format: ESC [ < Cb ; Cx ; Cy M (press) or m (release)
   */
  parseInput(data) {
    const str = data.toString();

    // Check for Ctrl+C
    if (str === '\x03') {
      this.exit();
      process.exit(0);
    }

    // Parse SGR mouse events: \x1b[<button;x;yM or \x1b[<button;x;ym
    const sgrRegex = /\x1b\[<(\d+);(\d+);(\d+)([Mm])/g;
    let match;

    while ((match = sgrRegex.exec(str)) !== null) {
      const buttons = parseInt(match[1], 10);
      const x = parseInt(match[2], 10) - 1;  // Convert to 0-indexed
      const y = parseInt(match[3], 10) - 1;
      const isRelease = match[4] === 'm';

      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.buttons = isRelease ? 0 : buttons;

      // Notify listeners
      for (const listener of this.mouseListeners) {
        listener(this.mouse);
      }
    }

    // Parse keyboard input
    // Arrow keys: ESC [ A/B/C/D (or ESC O A/B/C/D on some terminals)
    // Regular keys: single chars
    let key = null;

    // Check for arrow keys (multiple possible formats)
    if (str === '\x1b[A' || str === '\x1bOA' || str === 'w' || str === 'W') key = 'up';
    else if (str === '\x1b[B' || str === '\x1bOB' || str === 's' || str === 'S') key = 'down';
    else if (str === '\x1b[C' || str === '\x1bOC' || str === 'd' || str === 'D') key = 'right';
    else if (str === '\x1b[D' || str === '\x1bOD' || str === 'a' || str === 'A') key = 'left';
    else if (str === ' ') key = 'space';
    else if (str === '\r' || str === '\n') key = 'enter';
    else if (str.length === 1 && str >= '1' && str <= '9') key = str;
    else if (str.length > 0 && !str.startsWith('\x1b[<')) {
      // Unknown key - show raw bytes for debugging
      key = 'raw:' + [...str].map(c => c.charCodeAt(0).toString(16)).join(',');
    }

    if (key) {
      // Notify listeners
      for (const listener of this.keyListeners) {
        listener(key);
      }
    }
  }

  /**
   * Register a mouse event listener
   */
  onMouse(callback) {
    this.mouseListeners.push(callback);
  }

  /**
   * Register a keyboard event listener
   */
  onKey(callback) {
    this.keyListeners.push(callback);
  }

  handleResize() {
    this.width = process.stdout.columns || 80;
    this.height = process.stdout.rows || 24;
    this.front = this.createBuffer();
    this.back = this.createBuffer();

    // Force full redraw on next flush
    process.stdout.write(ANSI.clear);
  }

  /**
   * Set a cell in the back buffer
   */
  set(x, y, char, fg = null, bg = null) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.back[y][x].char = char;
    this.back[y][x].fg = fg;
    this.back[y][x].bg = bg;
  }

  /**
   * Clear the back buffer
   */
  clear(char = ' ', fg = null, bg = null) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.back[y][x].char = char;
        this.back[y][x].fg = fg;
        this.back[y][x].bg = bg;
      }
    }
  }

  /**
   * Write a string starting at position
   */
  write(x, y, str, fg = null, bg = null) {
    for (let i = 0; i < str.length; i++) {
      this.set(x + i, y, str[i], fg, bg);
    }
  }

  /**
   * Diff and flush changes to terminal
   * Only emits ANSI for cells that changed
   */
  flush() {
    let output = '';
    let lastX = -1, lastY = -1;
    let lastFg = null, lastBg = null;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const frontCell = this.front[y][x];
        const backCell = this.back[y][x];

        if (!frontCell.equals(backCell)) {
          // Move cursor if not sequential
          if (y !== lastY || x !== lastX + 1) {
            output += ANSI.moveTo(y + 1, x + 1); // ANSI is 1-indexed
          }

          // Update colors if changed
          if (backCell.fg !== lastFg) {
            output += backCell.fg !== null ? ANSI.fg(backCell.fg) : ANSI.reset;
            lastFg = backCell.fg;
            lastBg = null; // Reset tracking after reset
          }
          if (backCell.bg !== lastBg && backCell.bg !== null) {
            output += ANSI.bg(backCell.bg);
            lastBg = backCell.bg;
          }

          output += backCell.char;
          lastX = x;
          lastY = y;

          // Copy to front buffer
          this.front[y][x] = backCell.clone();
        }
      }
    }

    if (output) {
      process.stdout.write(output);
    }
  }
}

export { ANSI, Cell, Framebuffer };
