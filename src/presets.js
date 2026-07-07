/** @typedef {{ id: string, label: string, green: number|null, yellow: number|null, red: number, grace: number, prep?: number, qualifyMin?: number, qualifyMax?: number }} Preset */

/** @type {Record<string, Preset>} */
export const PRESETS = {
  speech_4_5_6: {
    id: 'speech_4_5_6',
    label: 'Mowa 4–5–6',
    green: 240,
    yellow: 300,
    red: 360,
    grace: 30,
  },
  speech_5_6_7: {
    id: 'speech_5_6_7',
    label: 'Mowa 5–6–7',
    green: 300,
    yellow: 360,
    red: 420,
    grace: 30,
  },
  speech_7_8_9: {
    id: 'speech_7_8_9',
    label: 'Mowa 7–8–9',
    green: 420,
    yellow: 480,
    red: 540,
    grace: 30,
  },
  gp: {
    id: 'gp',
    label: 'Gorące Pytania',
    green: 60,
    yellow: 90,
    red: 120,
    grace: 30,
    prep: 20,
    qualifyMin: 60,
    qualifyMax: 150,
  },
  evaluation: {
    id: 'evaluation',
    label: 'Ewaluacja (1 min)',
    green: null,
    yellow: null,
    red: 60,
    grace: 0,
  },
};

/** @returns {Preset[]} */
export function getPresetList() {
  return Object.values(PRESETS);
}

/** @param {string|null|undefined} id */
export function getPreset(id) {
  return id ? PRESETS[id] ?? null : null;
}

/** @param {number} totalSeconds */
export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** @param {number} ms */
export function formatTimeMs(ms) {
  return formatTime(ms / 1000);
}

/**
 * @param {Preset} preset
 * @param {number} elapsedMs
 */
export function evaluateResult(preset, elapsedMs) {
  const sec = elapsedMs / 1000;

  if (preset.id === 'gp') {
    const qualified = sec >= preset.qualifyMin && sec <= preset.qualifyMax;
    let status = 'w ramach';
    if (sec < preset.qualifyMin) status = 'za krótko';
    else if (sec > preset.qualifyMax) status = 'za długo';
    return { inRange: qualified, qualified, status };
  }

  if (preset.id === 'evaluation') {
    return { inRange: true, qualified: null, status: 'w ramach' };
  }

  const maxAllowed = preset.red + preset.grace;
  let status = 'w ramach';
  if (preset.green != null && sec < preset.green) status = 'poniżej minimum';
  else if (sec > maxAllowed) status = 'powyżej maksimum';

  return {
    inRange: sec >= (preset.green ?? 0) && sec <= maxAllowed,
    qualified: null,
    status,
  };
}

/**
 * @param {Preset} preset
 * @param {number} elapsedMs
 * @returns {'neutral'|'green'|'yellow'|'red'}
 */
export function getFlagForElapsed(preset, elapsedMs) {
  const sec = elapsedMs / 1000;

  if (preset.id === 'evaluation') {
    return sec >= preset.red ? 'red' : 'neutral';
  }

  if (sec >= preset.red) return 'red';
  if (preset.yellow != null && sec >= preset.yellow) return 'yellow';
  if (preset.green != null && sec >= preset.green) return 'green';
  return 'neutral';
}

/** @param {Preset} preset @param {number} elapsedMs */
export function isInGrace(preset, elapsedMs) {
  const sec = elapsedMs / 1000;
  return sec >= preset.red && sec < preset.red + preset.grace;
}
