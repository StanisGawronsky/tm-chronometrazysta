import { formatTimeInput, formatTimeMs, getPreset, getPresetList, resolveSpeakerPreset } from './presets.js';
import { renderReportHtml } from './report.js';

/**
 * @param {HTMLElement} root
 * @param {import('./state.js').Session} session
 * @param {{ onAddSpeaker: (name: string) => void, onNewMeeting: () => void, onPresetChange: (id: string, presetId: string) => void, onCustomTimeChange: (id: string, field: 't1'|'t2'|'t3', value: string) => void, onStart: (id: string) => void, onPause: (id: string) => void, onResume: (id: string) => void, onStop: (id: string) => void, onCopyReport: () => void }} handlers
 * @param {{ flag: string, inGrace: boolean, active: boolean }} bgState
 */
export function renderApp(root, session, handlers, bgState) {
  const presets = getPresetList();
  const activeId = session.activeSpeakerId;
  const hasActiveTimer = activeId != null;

  root.innerHTML = `
    <div class="app-shell">
      <header class="header">
        <h1>TM Chronometrażysta</h1>
        <button type="button" class="btn btn-ghost btn-sm" data-action="new-meeting">Nowe spotkanie</button>
      </header>

      <section class="add-speaker">
        <input
          type="text"
          class="input"
          placeholder="Imię mówcy…"
          data-input="speaker-name"
          autocomplete="off"
          enterkeyhint="done"
        />
        <button type="button" class="btn btn-primary" data-action="add-speaker">+</button>
      </section>
      <p class="error-msg hidden" data-el="error"></p>

      <section class="speakers" data-el="speakers">
        ${session.speakers.length === 0 ? '<p class="empty">Dodaj mówców przyciskiem +</p>' : ''}
        ${session.speakers.map((s) => renderSpeakerCard(s, presets, activeId, hasActiveTimer)).join('')}
      </section>

      <section class="report-section">
        <h2>Raport</h2>
        ${renderReportHtml(session.speakers)}
        <button type="button" class="btn btn-secondary" data-action="copy-report">Kopiuj raport</button>
        <p class="copy-toast hidden" data-el="copy-toast">Skopiowano!</p>
      </section>
    </div>
  `;

  applyBackground(root, bgState);

  root.querySelector('[data-action="new-meeting"]')?.addEventListener('click', handlers.onNewMeeting);

  const input = root.querySelector('[data-input="speaker-name"]');
  const addBtn = root.querySelector('[data-action="add-speaker"]');

  const submitAdd = () => {
    if (!(input instanceof HTMLInputElement)) return;
    handlers.onAddSpeaker(input.value);
    input.value = '';
    input.focus();
  };

  addBtn?.addEventListener('click', submitAdd);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitAdd();
  });

  root.querySelector('[data-action="copy-report"]')?.addEventListener('click', handlers.onCopyReport);

  root.querySelectorAll('[data-preset]').forEach((el) => {
    el.addEventListener('change', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLSelectElement)) return;
      const id = target.dataset.speakerId;
      if (id) handlers.onPresetChange(id, target.value);
    });
  });

  root.querySelectorAll('[data-custom-time]').forEach((el) => {
    if (!(el instanceof HTMLInputElement)) return;
    const speakerId = el.dataset.speakerId;
    const field = el.dataset.customTime;
    if (!speakerId || !field) return;

    const emit = () => {
      handlers.onCustomTimeChange(speakerId, /** @type {'t1'|'t2'|'t3'} */ (field), el.value);
    };

    el.addEventListener('change', emit);
    el.addEventListener('blur', emit);
  });

  root.querySelectorAll('[data-action]').forEach((el) => {
    if (!(el instanceof HTMLButtonElement)) return;
    const action = el.dataset.action;
    const id = el.dataset.speakerId;
    if (!id || !action) return;
    if (action === 'start') el.addEventListener('click', () => handlers.onStart(id));
    if (action === 'pause') el.addEventListener('click', () => handlers.onPause(id));
    if (action === 'resume') el.addEventListener('click', () => handlers.onResume(id));
    if (action === 'stop') el.addEventListener('click', () => handlers.onStop(id));
  });
}

/**
 * @param {import('./state.js').Speaker} speaker
 * @param {import('./presets.js').Preset[]} presets
 * @param {string|null} activeId
 * @param {boolean} hasActiveTimer
 */
function renderSpeakerCard(speaker, presets, activeId, hasActiveTimer) {
  const isActive = speaker.id === activeId;
  const isLocked = hasActiveTimer && !isActive && speaker.phase !== 'finished';
  const preset = resolveSpeakerPreset(speaker) ?? getPreset(speaker.presetId);
  const canStart = preset && (speaker.phase === 'idle' || speaker.phase === 'finished');
  const isRunning = speaker.phase === 'running' || speaker.phase === 'prep' || speaker.phase === 'grace';
  const isPaused = speaker.phase === 'paused';
  const isFinished = speaker.phase === 'finished' && speaker.elapsedMs != null;

  const presetOptions = presets
    .map(
      (p) =>
        `<option value="${p.id}" ${speaker.presetId === p.id ? 'selected' : ''}>${p.label}</option>`,
    )
    .join('');

  const displayTime = isFinished
    ? formatTimeMs(speaker.elapsedMs)
    : speaker.liveTime ?? '0:00';

  const prepLine =
    speaker.phase === 'prep' && speaker.prepRemaining != null
      ? `<p class="prep-label">Przygotowanie: ${Math.ceil(speaker.prepRemaining / 1000)} s</p>`
      : '';

  const graceLine =
    speaker.inGrace && isRunning
      ? '<p class="grace-label">+30 s po czerwonej</p>'
      : '';

  const statusBadge = isFinished
    ? `<span class="badge ${speaker.inRange === false ? 'badge-bad' : 'badge-ok'}">${speaker.status ?? '—'}</span>`
    : '';

  const phaseLabel = {
    idle: 'Gotowy',
    prep: 'Przygotowanie',
    running: 'Trwa',
    paused: 'Pauza',
    grace: 'Czerwona + grace',
    finished: 'Zakończono',
  }[speaker.phase] ?? '';

  return `
    <article class="speaker-card ${isActive ? 'is-active' : ''} ${isLocked ? 'is-locked' : ''}" data-speaker-id="${speaker.id}">
      <div class="speaker-head">
        <h3>${escapeHtml(speaker.name)}</h3>
        <span class="phase-tag">${phaseLabel}</span>
      </div>

      <label class="preset-label">
        Typ wystąpienia
        <select class="select" data-preset data-speaker-id="${speaker.id}" ${isRunning || isPaused ? 'disabled' : ''}>
          <option value="">— wybierz —</option>
          ${presetOptions}
        </select>
      </label>

      ${speaker.presetId === 'custom' ? renderCustomTimes(speaker, isRunning || isPaused) : ''}

      ${prepLine}
      <p class="timer-display" data-timer="${speaker.id}">${displayTime}</p>
      ${graceLine}
      ${statusBadge}

      <div class="controls">
        ${canStart && !isRunning && !isPaused ? `<button type="button" class="btn btn-primary btn-lg" data-action="start" data-speaker-id="${speaker.id}" ${isLocked ? 'disabled' : ''}>Start</button>` : ''}
        ${isRunning ? `<button type="button" class="btn btn-secondary btn-lg" data-action="pause" data-speaker-id="${speaker.id}">Pauza</button>` : ''}
        ${isPaused ? `<button type="button" class="btn btn-primary btn-lg" data-action="resume" data-speaker-id="${speaker.id}">Wznów</button>` : ''}
        ${(isRunning || isPaused) ? `<button type="button" class="btn btn-danger btn-lg" data-action="stop" data-speaker-id="${speaker.id}">Stop</button>` : ''}
      </div>
    </article>
  `;
}

/**
 * @param {import('./state.js').Speaker} speaker
 * @param {boolean} disabled
 */
function renderCustomTimes(speaker, disabled) {
  const times = speaker.customTimes ?? { t1: null, t2: null, t3: null };

  return `
    <div class="custom-times">
      <p class="custom-times-hint">Czasy z agendy (format np. 5:00 lub 5)</p>
      <div class="custom-times-grid">
        <label class="custom-time-field">
          <span>Agenda 1 · zielona</span>
          <input
            type="text"
            class="input input-sm"
            inputmode="numeric"
            placeholder="5:00"
            data-custom-time="t1"
            data-speaker-id="${speaker.id}"
            value="${formatTimeInput(times.t1)}"
            ${disabled ? 'disabled' : ''}
          />
        </label>
        <label class="custom-time-field">
          <span>Agenda 2 · żółta</span>
          <input
            type="text"
            class="input input-sm"
            inputmode="numeric"
            placeholder="6:00"
            data-custom-time="t2"
            data-speaker-id="${speaker.id}"
            value="${formatTimeInput(times.t2)}"
            ${disabled ? 'disabled' : ''}
          />
        </label>
        <label class="custom-time-field">
          <span>Agenda 3 · czerwona</span>
          <input
            type="text"
            class="input input-sm"
            inputmode="numeric"
            placeholder="7:00"
            data-custom-time="t3"
            data-speaker-id="${speaker.id}"
            value="${formatTimeInput(times.t3)}"
            ${disabled ? 'disabled' : ''}
            required
          />
        </label>
      </div>
    </div>
  `;
}

/** @param {HTMLElement} root @param {{ flag: string, inGrace: boolean, active: boolean }} bgState */
export function applyBackground(root, bgState) {
  const body = document.body;
  body.classList.remove('bg-neutral', 'bg-green', 'bg-yellow', 'bg-red', 'bg-blink', 'bg-blink-fast');

  if (!bgState.active) {
    body.classList.add('bg-neutral');
    return;
  }

  body.classList.add(`bg-${bgState.flag}`);
  body.classList.add(bgState.inGrace ? 'bg-blink-fast' : 'bg-blink');
}

/** @param {HTMLElement} root @param {string} message */
export function showError(root, message) {
  const el = root.querySelector('[data-el="error"]');
  if (!(el instanceof HTMLElement)) return;
  if (!message) {
    el.textContent = '';
    el.classList.add('hidden');
    return;
  }
  el.textContent = message;
  el.classList.remove('hidden');
}

/** @param {HTMLElement} root */
export function showCopyToast(root) {
  const el = root.querySelector('[data-el="copy-toast"]');
  if (!(el instanceof HTMLElement)) return;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2000);
}

/** @param {string} s */
function escapeHtml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Lightweight timer display update without full re-render
 * @param {HTMLElement} root
 * @param {string} speakerId
 * @param {string} time
 * @param {{ prepRemaining?: number, inGrace?: boolean }} extra
 */
export function updateTimerDisplay(root, speakerId, time, extra = {}) {
  const el = root.querySelector(`[data-timer="${speakerId}"]`);
  if (el) el.textContent = time;

  const card = root.querySelector(`[data-speaker-id="${speakerId}"]`);
  if (!(card instanceof HTMLElement)) return;

  let prepEl = card.querySelector('.prep-label');
  if (extra.prepRemaining != null && extra.prepRemaining > 0) {
    if (!prepEl) {
      prepEl = document.createElement('p');
      prepEl.className = 'prep-label';
      const timer = card.querySelector('.timer-display');
      timer?.before(prepEl);
    }
    prepEl.textContent = `Przygotowanie: ${Math.ceil(extra.prepRemaining / 1000)} s`;
  } else if (prepEl) {
    prepEl.remove();
  }

  let graceEl = card.querySelector('.grace-label');
  if (extra.inGrace) {
    if (!graceEl) {
      graceEl = document.createElement('p');
      graceEl.className = 'grace-label';
      const timer = card.querySelector('.timer-display');
      timer?.after(graceEl);
    }
    graceEl.textContent = '+30 s po czerwonej';
  } else if (graceEl) {
    graceEl.remove();
  }
}
