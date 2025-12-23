/**
 * Animation Engine
 * State machine, easing, and ambient oscillation
 */

// Animation states
const States = {
  IDLE_SYSTEM: 'IDLE_SYSTEM',
  TWEENING_TO_COMPONENT: 'TWEENING_TO_COMPONENT',
  IDLE_COMPONENT: 'IDLE_COMPONENT',
  TWEENING_TO_SYSTEM: 'TWEENING_TO_SYSTEM'
};

// Timing configuration (milliseconds)
const Timing = {
  IDLE_DURATION: 2000,
  TWEEN_DURATION: 1500,
  FRAME_INTERVAL: 50  // ~20 FPS
};

// Ambient oscillation parameters
const Ambient = {
  breathe: {
    frequency: 0.3,    // Hz - slow, meditative
    amplitude: 0.03    // 3% scale variance
  },
  drift: {
    frequency: 0.1,    // Hz - glacial positional drift
    amplitude: 1       // characters
  }
};

/**
 * Easing functions
 */
function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function linear(t) {
  return t;
}

/**
 * Interpolation helpers
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpPosition(posA, posB, t) {
  return {
    x: lerp(posA.x, posB.x, t),
    y: lerp(posA.y, posB.y, t)
  };
}

/**
 * Ambient animation calculations
 */
function getBreathScale(time, phase = 0) {
  const t = time / 1000; // convert to seconds
  return 1 + Ambient.breathe.amplitude *
    Math.sin(2 * Math.PI * Ambient.breathe.frequency * t + phase);
}

function getDrift(time, phase = 0) {
  const t = time / 1000;
  return {
    x: Ambient.drift.amplitude * Math.sin(2 * Math.PI * Ambient.drift.frequency * t + phase),
    y: Ambient.drift.amplitude * Math.cos(2 * Math.PI * Ambient.drift.frequency * t + phase * 1.3)
  };
}

/**
 * State machine
 */
function createStateMachine(demoSequence) {
  return {
    state: States.IDLE_SYSTEM,
    stateStartTime: Date.now(),
    focusIndex: 0,
    demoSequence,

    getCurrentFocus() {
      return this.demoSequence[this.focusIndex];
    },

    getProgress() {
      const elapsed = Date.now() - this.stateStartTime;

      if (this.state === States.IDLE_SYSTEM || this.state === States.IDLE_COMPONENT) {
        return Math.min(1, elapsed / Timing.IDLE_DURATION);
      } else {
        return Math.min(1, elapsed / Timing.TWEEN_DURATION);
      }
    },

    getTweenProgress() {
      if (this.state !== States.TWEENING_TO_COMPONENT &&
          this.state !== States.TWEENING_TO_SYSTEM) {
        return this.state === States.IDLE_SYSTEM ? 0 : 1;
      }

      const raw = this.getProgress();
      const eased = easeInOutCubic(raw);

      return this.state === States.TWEENING_TO_COMPONENT ? eased : 1 - eased;
    },

    update() {
      const progress = this.getProgress();

      if (progress >= 1) {
        this.transition();
      }
    },

    transition() {
      this.stateStartTime = Date.now();

      switch (this.state) {
        case States.IDLE_SYSTEM:
          this.state = States.TWEENING_TO_COMPONENT;
          break;
        case States.TWEENING_TO_COMPONENT:
          this.state = States.IDLE_COMPONENT;
          break;
        case States.IDLE_COMPONENT:
          this.state = States.TWEENING_TO_SYSTEM;
          break;
        case States.TWEENING_TO_SYSTEM:
          this.state = States.IDLE_SYSTEM;
          // Advance to next focus node
          this.focusIndex = (this.focusIndex + 1) % this.demoSequence.length;
          break;
      }
    }
  };
}

export {
  States,
  Timing,
  Ambient,
  easeInOutCubic,
  easeInOutQuad,
  linear,
  lerp,
  lerpPosition,
  getBreathScale,
  getDrift,
  createStateMachine
};
