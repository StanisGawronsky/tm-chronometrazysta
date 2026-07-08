const STORAGE_KEY = 'tm-chronometrazysta-session';

/**
 * @typedef {object} Speaker
 * @property {string} id
 * @property {string} name
 * @property {string|null} presetId
 * @property {{ t1: number|null, t2: number|null, t3: number|null }|null} [customTimes]
 * @property {'idle'|'prep'|'running'|'paused'|'grace'|'finished'} phase
 * @property {number|null} elapsedMs
 * @property {string|null} finishedAt
 * @property {boolean|null} inRange
 * @property {boolean|null} qualified
 * @property {string|null} status
 */

/**
 * @typedef {object} Session
 * @property {Speaker[]} speakers
 * @property {string|null} activeSpeakerId
 */

/** @returns {Speaker} */
export function createSpeaker(name) {
  return {
    id: crypto.randomUUID(),
    name,
    presetId: null,
    customTimes: null,
    phase: 'idle',
    elapsedMs: null,
    finishedAt: null,
    inRange: null,
    qualified: null,
    status: null,
  };
}

/** @returns {Session} */
export function createEmptySession() {
  return { speakers: [], activeSpeakerId: null };
}

/** @returns {Session} */
export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptySession();
    const parsed = JSON.parse(raw);
    return {
      speakers: Array.isArray(parsed.speakers) ? parsed.speakers : [],
      activeSpeakerId: parsed.activeSpeakerId ?? null,
    };
  } catch {
    return createEmptySession();
  }
}

/** @param {Session} session */
export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

/** @param {Session} session */
export function clearSession() {
  saveSession(createEmptySession());
}

/**
 * @param {Session} session
 * @param {string} name
 */
export function addSpeaker(session, name) {
  const trimmed = name.trim();
  if (!trimmed) return { error: 'Podaj imię mówcy.' };

  const duplicate = session.speakers.some(
    (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (duplicate) return { error: 'Mówca o tym imieniu już jest na liście.' };

  const speaker = createSpeaker(trimmed);
  session.speakers.push(speaker);
  saveSession(session);
  return { speaker };
}

/**
 * @param {Session} session
 * @param {string} speakerId
 * @param {string} presetId
 */
export function setSpeakerPreset(session, speakerId, presetId) {
  const speaker = session.speakers.find((s) => s.id === speakerId);
  if (!speaker || speaker.phase !== 'idle' && speaker.phase !== 'finished') return;
  speaker.presetId = presetId;
  if (presetId === 'custom' && !speaker.customTimes) {
    speaker.customTimes = { t1: null, t2: null, t3: null };
  }
  if (presetId !== 'custom') {
    speaker.customTimes = null;
  }
  if (speaker.phase === 'finished') {
    speaker.phase = 'idle';
    speaker.elapsedMs = null;
    speaker.finishedAt = null;
    speaker.inRange = null;
    speaker.qualified = null;
    speaker.status = null;
  }
  saveSession(session);
}

/**
 * @param {Session} session
 * @param {string} speakerId
 * @param {'t1'|'t2'|'t3'} field
 * @param {number|null} seconds
 */
export function setSpeakerCustomTime(session, speakerId, field, seconds) {
  const speaker = session.speakers.find((s) => s.id === speakerId);
  if (!speaker || speaker.presetId !== 'custom') return;
  if (!speaker.customTimes) {
    speaker.customTimes = { t1: null, t2: null, t3: null };
  }
  speaker.customTimes[field] = seconds;
  if (speaker.phase === 'finished') {
    speaker.phase = 'idle';
    speaker.elapsedMs = null;
    speaker.finishedAt = null;
    speaker.inRange = null;
    speaker.qualified = null;
    speaker.status = null;
  }
  saveSession(session);
}

/**
 * @param {Session} session
 * @param {string|null} speakerId
 */
export function setActiveSpeaker(session, speakerId) {
  session.activeSpeakerId = speakerId;
  saveSession(session);
}

/**
 * @param {Session} session
 * @param {string} speakerId
 * @param {Partial<Speaker>} updates
 */
export function updateSpeaker(session, speakerId, updates) {
  const speaker = session.speakers.find((s) => s.id === speakerId);
  if (!speaker) return;
  Object.assign(speaker, updates);
  saveSession(session);
}

/**
 * @param {Session} session
 * @param {import('./csv-import.js').CsvRow[]} rows
 */
export function importSpeakersFromCsv(session, rows) {
  session.speakers = rows.map((row) => {
    const speaker = createSpeaker(row.name);
    speaker.presetId = row.presetId;
    speaker.customTimes = row.presetId === 'custom' ? row.customTimes : null;
    return speaker;
  });
  session.activeSpeakerId = null;
  saveSession(session);
}
