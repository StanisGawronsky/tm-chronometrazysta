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
  custom: {
    id: 'custom',
    label: 'Własne (agenda 1–2–3)',
    green: null,
    yellow: null,
    red: 0,
    grace: 30,
  },
};

/** @returns {Preset[]} */
export function getPresetList() {
  return Object.values(PRESETS);
}

/**
 * @typedef {{ t1: number|null, t2: number|null, t3: number|null }} CustomTimes
 */

/** @param {string} raw */
export function parseTimeInput(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes(':')) {
    const [minPart, secPart] = trimmed.split(':');
    const minutes = Number.parseInt(minPart, 10);
    const seconds = Number.parseInt(secPart, 10);
    if (Number.isNaN(minutes) || Number.isNaN(seconds) || seconds >= 60 || minutes < 0 || seconds < 0) {
      return null;
    }
    return minutes * 60 + seconds;
  }

  const minutes = Number.parseInt(trimmed, 10);
  if (Number.isNaN(minutes) || minutes < 0) return null;
  return minutes * 60;
}

/** @param {number|null} seconds */
export function formatTimeInput(seconds) {
  if (seconds == null) return '';
  return formatTime(seconds);
}

/**
 * @param {CustomTimes|null|undefined} times
 * @returns {string|null}
 */
export function validateCustomTimes(times) {
  if (!times || times.t3 == null) {
    return 'Podaj czas z agendy 3 (czerwona flaga).';
  }

  if (times.t1 != null && times.t2 != null && times.t1 > times.t2) {
    return 'Agenda 1 nie może być później niż agenda 2.';
  }
  if (times.t2 != null && times.t2 > times.t3) {
    return 'Agenda 2 nie może być później niż agenda 3.';
  }
  if (times.t1 != null && times.t1 > times.t3) {
    return 'Agenda 1 nie może być później niż agenda 3.';
  }

  return null;
}

/**
 * @param {CustomTimes} times
 * @returns {Preset}
 */
export function buildCustomPreset(times) {
  const t1 = times.t1 ?? null;
  const t2 = times.t2 ?? null;
  const t3 = times.t3 ?? 0;

  const parts = [t1, t2, t3].filter((v) => v != null).map((v) => formatTime(v));
  const label = parts.length > 0 ? `Własne (${parts.join(' · ')})` : 'Własne (agenda)';

  return {
    id: 'custom',
    label,
    green: t1,
    yellow: t2,
    red: t3,
    grace: 30,
  };
}

/**
 * @param {import('./state.js').Speaker} speaker
 * @returns {Preset|null}
 */
export function resolveSpeakerPreset(speaker) {
  if (speaker.presetId === 'custom') {
    if (!speaker.customTimes || speaker.customTimes.t3 == null) return null;
    if (validateCustomTimes(speaker.customTimes)) return null;
    return buildCustomPreset(speaker.customTimes);
  }
  return getPreset(speaker.presetId);
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

  if (preset.green == null && preset.yellow == null) {
    let status = 'w ramach';
    if (sec > maxAllowed) status = 'powyżej maksimum';
    return {
      inRange: sec <= maxAllowed,
      qualified: null,
      status,
    };
  }

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
