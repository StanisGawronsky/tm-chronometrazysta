import {
  addSpeaker,
  clearSession,
  loadSession,
  setActiveSpeaker,
  setSpeakerPreset,
  updateSpeaker,
} from './state.js';
import { evaluateResult, formatTimeMs, getPreset } from './presets.js';
import { createTimerEngine } from './timer-engine.js';
import { buildReportLines } from './report.js';
import { applyBackground, renderApp, showCopyToast, showError, updateTimerDisplay } from './ui.js';
import './styles.css';

const root = document.getElementById('app');
if (!root) throw new Error('#app not found');

/** @type {ReturnType<typeof loadSession>} */
let session = loadSession();

/** @type {ReturnType<typeof createTimerEngine>|null} */
let engine = null;

/** @type {string|null} */
let engineSpeakerId = null;

const bgState = { flag: 'neutral', inGrace: false, active: false };

function rerender() {
  const speakersWithLive = session.speakers.map((s) => {
    if (s.id === engineSpeakerId && engine) {
      const st = engine.getState();
      return {
        ...s,
        phase: st.phase,
        liveTime: formatTimeMs(st.mainElapsedMs),
        prepRemaining: st.prepRemainingMs,
        inGrace: st.inGrace,
      };
    }
    return s;
  });

  renderApp(
    root,
    { ...session, speakers: speakersWithLive },
    {
      onAddSpeaker: handleAddSpeaker,
      onNewMeeting: handleNewMeeting,
      onPresetChange: handlePresetChange,
      onStart: handleStart,
      onPause: handlePause,
      onResume: handleResume,
      onStop: handleStop,
      onCopyReport: handleCopyReport,
    },
    bgState,
  );
}

function handleAddSpeaker(name) {
  const result = addSpeaker(session, name);
  if (result.error) {
    rerender();
    showError(root, result.error);
    return;
  }
  showError(root, '');
  rerender();
}

function handleNewMeeting() {
  if (!confirm('Wyczyścić bieżącą sesję i zacząć od nowa?')) return;
  destroyEngine();
  clearSession();
  session = loadSession();
  bgState.active = false;
  bgState.flag = 'neutral';
  bgState.inGrace = false;
  rerender();
}

function handlePresetChange(speakerId, presetId) {
  if (!presetId) return;
  setSpeakerPreset(session, speakerId, presetId);
  rerender();
}

function destroyEngine() {
  engine?.destroy();
  engine = null;
  engineSpeakerId = null;
  bgState.active = false;
  bgState.flag = 'neutral';
  bgState.inGrace = false;
}

function handleStart(speakerId) {
  const speaker = session.speakers.find((s) => s.id === speakerId);
  if (!speaker) return;

  const preset = getPreset(speaker.presetId);
  if (!preset) {
    showError(root, 'Wybierz typ wystąpienia przed startem.');
    rerender();
    return;
  }

  if (session.activeSpeakerId && session.activeSpeakerId !== speakerId) return;

  destroyEngine();
  engineSpeakerId = speakerId;
  setActiveSpeaker(session, speakerId);

  updateSpeaker(session, speakerId, {
    phase: preset.prep ? 'prep' : 'running',
    elapsedMs: null,
    finishedAt: null,
    inRange: null,
    qualified: null,
    status: null,
  });

  engine = createTimerEngine(preset, {
    onTick: (st) => {
      updateSpeaker(session, speakerId, { phase: st.phase });
      updateTimerDisplay(root, speakerId, formatTimeMs(st.mainElapsedMs), {
        prepRemaining: st.prepRemainingMs,
        inGrace: st.inGrace,
      });
    },
    onFlagChange: (flag, inGrace) => {
      bgState.active = true;
      bgState.flag = flag;
      bgState.inGrace = inGrace;
      applyBackground(root, bgState);
    },
  });

  bgState.active = true;
  engine.start();
  rerender();
}

function handlePause(speakerId) {
  if (engineSpeakerId !== speakerId || !engine) return;
  engine.pause();
  updateSpeaker(session, speakerId, { phase: 'paused' });
  bgState.active = false;
  applyBackground(root, bgState);
  rerender();
}

function handleResume(speakerId) {
  if (engineSpeakerId !== speakerId || !engine) return;
  engine.resume();
  const st = engine.getState();
  updateSpeaker(session, speakerId, { phase: st.phase });
  bgState.active = true;
  bgState.flag = st.flag;
  bgState.inGrace = st.inGrace;
  applyBackground(root, bgState);
  rerender();
}

function handleStop(speakerId) {
  if (engineSpeakerId !== speakerId || !engine) return;

  const speaker = session.speakers.find((s) => s.id === speakerId);
  const preset = getPreset(speaker?.presetId);
  if (!preset || !speaker) return;

  const elapsedMs = engine.stop();
  const result = evaluateResult(preset, elapsedMs);

  updateSpeaker(session, speakerId, {
    phase: 'finished',
    elapsedMs,
    finishedAt: new Date().toISOString(),
    inRange: result.inRange,
    qualified: result.qualified,
    status: result.status,
  });

  destroyEngine();
  setActiveSpeaker(session, null);
  rerender();
}

async function handleCopyReport() {
  const { text } = buildReportLines(session.speakers);
  try {
    await navigator.clipboard.writeText(text);
    showCopyToast(root);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showCopyToast(root);
  }
}

rerender();
