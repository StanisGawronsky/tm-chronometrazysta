import { getFlagForElapsed, isInGrace } from './presets.js';

/**
 * @typedef {'idle'|'prep'|'running'|'paused'|'grace'|'finished'} TimerPhase
 * @typedef {'neutral'|'green'|'yellow'|'red'} FlagColor
 *
 * @typedef {object} TimerSnapshot
 * @property {TimerPhase} phase
 * @property {number} mainElapsedMs
 * @property {number} prepRemainingMs
 * @property {FlagColor} flag
 * @property {boolean} inGrace
 */

/**
 * @param {import('./presets.js').Preset} preset
 * @param {{ onTick?: (s: TimerSnapshot) => void, onFlagChange?: (flag: FlagColor, inGrace: boolean) => void }} callbacks
 */
export function createTimerEngine(preset, callbacks = {}) {
  /** @type {TimerPhase} */
  let phase = 'idle';
  let mainElapsedMs = 0;
  let prepRemainingMs = preset.prep ? preset.prep * 1000 : 0;
  /** @type {ReturnType<typeof setInterval>|null} */
  let intervalId = null;
  /** @type {FlagColor} */
  let flag = 'neutral';
  let inGracePhase = false;

  function snapshot() {
    return {
      phase,
      mainElapsedMs,
      prepRemainingMs,
      flag,
      inGrace: inGracePhase,
    };
  }

  function emitTick() {
    callbacks.onTick?.(snapshot());
  }

  function updateFlag() {
    const nextFlag = getFlagForElapsed(preset, mainElapsedMs);
    const nextGrace = isInGrace(preset, mainElapsedMs);

    if (nextFlag !== flag || nextGrace !== inGracePhase) {
      flag = nextFlag;
      inGracePhase = nextGrace;
      callbacks.onFlagChange?.(flag, inGracePhase);
    }
  }

  function tick() {
    if (phase === 'prep') {
      prepRemainingMs = Math.max(0, prepRemainingMs - 100);
      if (prepRemainingMs === 0) {
        phase = 'running';
      }
      emitTick();
      return;
    }

    if (phase === 'running' || phase === 'grace') {
      mainElapsedMs += 100;
      const grace = isInGrace(preset, mainElapsedMs);
      if (grace && phase === 'running') {
        phase = 'grace';
      }
      if (!grace && phase === 'grace' && preset.grace > 0) {
        phase = 'running';
      }
      inGracePhase = grace;
      updateFlag();
      emitTick();
    }
  }

  function startLoop() {
    stopLoop();
    intervalId = setInterval(tick, 100);
  }

  function stopLoop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return {
    getState: snapshot,

    start() {
      if (phase === 'running' || phase === 'prep' || phase === 'grace') return;

      if (preset.prep && phase === 'idle') {
        phase = 'prep';
        prepRemainingMs = preset.prep * 1000;
        startLoop();
        emitTick();
        return;
      }

      phase = 'running';
      startLoop();
      emitTick();
    },

    pause() {
      if (phase !== 'running' && phase !== 'prep' && phase !== 'grace') return;
      stopLoop();
      phase = 'paused';
      emitTick();
    },

    resume() {
      if (phase !== 'paused') return;
      if (preset.prep && prepRemainingMs > 0) {
        phase = 'prep';
      } else if (isInGrace(preset, mainElapsedMs)) {
        phase = 'grace';
      } else {
        phase = 'running';
      }
      startLoop();
      emitTick();
    },

    stop() {
      stopLoop();
      phase = 'finished';
      updateFlag();
      emitTick();
      return mainElapsedMs;
    },

    reset() {
      stopLoop();
      phase = 'idle';
      mainElapsedMs = 0;
      prepRemainingMs = preset.prep ? preset.prep * 1000 : 0;
      flag = 'neutral';
      inGracePhase = false;
      emitTick();
    },

    destroy() {
      stopLoop();
    },
  };
}
