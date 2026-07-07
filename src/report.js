import { evaluateResult, formatTimeMs, getPreset, getPresetList } from './presets.js';

/**
 * @param {import('./state.js').Speaker[]} speakers
 */
export function buildReportLines(speakers) {
  const finished = speakers.filter((s) => s.elapsedMs != null);
  if (finished.length === 0) {
    return { lines: [], text: 'Brak zakończonych wystąpień.' };
  }

  const lines = finished.map((s) => {
    const time = formatTimeMs(s.elapsedMs);
    const status = s.status ?? '—';
    return `${s.name} — ${time} — ${status}`;
  });

  const allInRange = finished.every((s) => s.inRange !== false);
  const summary = allInRange
    ? 'Spotkanie przebiegło zgodnie z agendą.'
    : 'Część wystąpień wymagała uwagi czasowej.';

  const gpFinished = finished.filter((s) => getPreset(s.presetId)?.id === 'gp');
  const gpNote =
    gpFinished.length > 0
      ? `\nGorące Pytania — kwalifikacja: ${gpFinished
          .map((s) => `${s.name} (${s.qualified ? 'tak' : 'nie'})`)
          .join(', ')}.`
      : '';

  const advice =
    'Rada: gdy widzicie żółtą flagę — czas na pointę. Czerwona to jeszcze 30 sekund na domknięcie.';

  const text = [
    'Raport chronometrażysty',
    '',
    summary,
    '',
    'Czasy mówców:',
    ...lines.map((l) => `- ${l}`),
    gpNote,
    '',
    advice,
  ]
    .filter(Boolean)
    .join('\n');

  return { lines, text };
}

/** @param {import('./state.js').Speaker[]} speakers */
export function renderReportHtml(speakers) {
  const { lines } = buildReportLines(speakers);
  const finished = speakers.filter((s) => s.elapsedMs != null);

  if (finished.length === 0) {
    return '<p class="report-empty">Brak zakończonych wystąpień.</p>';
  }

  const items = finished
    .map((s) => {
      const badgeClass = s.inRange === false ? 'badge-bad' : 'badge-ok';
      const status = s.status ?? '—';
      return `<li><strong>${escapeHtml(s.name)}</strong> — ${formatTimeMs(s.elapsedMs)} — <span class="badge ${badgeClass}">${escapeHtml(status)}</span></li>`;
    })
    .join('');

  return `<ul class="report-list">${items}</ul>`;
}

/** @param {string} s */
function escapeHtml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export { getPresetList };
