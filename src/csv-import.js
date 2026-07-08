import { parseTimeInput, validateCustomTimes } from './presets.js';

/** @typedef {{ name: string, presetId: string, customTimes: { t1: number|null, t2: number|null, t3: number|null }|null }} CsvRow */

export const AI_CSV_PROMPT = `Przeanalizuj załączone zdjęcie agendy spotkania Toastmasters i wygeneruj WYŁĄCZNIE plik CSV (bez komentarzy, bez markdown).

Kolumny (nagłówek w pierwszym wierszu):
imie,typ,agenda1,agenda2,agenda3

Zasady:
- imie — imię mówcy dokładnie jak na agendzie
- typ — jedna z wartości:
  • mowa — mowa zaplanowana z czasami z agendy (wypełnij agenda1, agenda2, agenda3)
  • gp — Gorące Pytania (pozostaw agenda1–3 puste)
  • ewaluacja — ewaluacja 1 min (pozostaw agenda1–3 puste)
  • speech_4_5_6 — gotowy preset 4–5–6 min (pozostaw agenda1–3 puste)
  • speech_5_6_7 — gotowy preset 5–6–7 min
  • speech_7_8_9 — gotowy preset 7–8–9 min
- agenda1 — czas zielonej flagi (min), format M:SS lub M (np. 5:00 lub 5)
- agenda2 — czas żółtej flagi (opt), format M:SS lub M
- agenda3 — czas czerwonej flagi (max), format M:SS lub M
- Jeśli na agendzie jest tylko jeden czas mowy — wpisz go w agenda3, agenda1 i agenda2 zostaw puste
- Uwzględnij tylko osoby wymagające pomiaru czasu (mowy zaplanowane, ewentualnie ewaluacje po mowach)
- Nie dodawaj osób funkcyjnych bez wystąpienia na scenie (chyba że mają mierzony czas)
- Separator: przecinek
- Bez cudzysłowów, jeśli nie są konieczne

Przykład:
imie,typ,agenda1,agenda2,agenda3
Ania,mowa,5:00,6:00,7:00
Jan,mowa,4:00,5:00,6:00
Piotr,gp,,,
Maria,ewaluacja,,,`;

/** @type {Record<string, string>} */
const PRESET_ALIASES = {
  gp: 'gp',
  'gorace pytania': 'gp',
  'gorące pytania': 'gp',
  'gorace_pytania': 'gp',
  ewaluacja: 'evaluation',
  evaluation: 'evaluation',
  mowa: 'custom',
  custom: 'custom',
  wlasne: 'custom',
  własne: 'custom',
  speech_4_5_6: 'speech_4_5_6',
  '4-5-6': 'speech_4_5_6',
  'mowa 4-5-6': 'speech_4_5_6',
  speech_5_6_7: 'speech_5_6_7',
  '5-6-7': 'speech_5_6_7',
  'mowa 5-6-7': 'speech_5_6_7',
  speech_7_8_9: 'speech_7_8_9',
  '7-8-9': 'speech_7_8_9',
  'mowa 7-8-9': 'speech_7_8_9',
};

/**
 * @param {string} line
 * @returns {string[]}
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if ((ch === ',' || ch === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

/**
 * @param {string} header
 * @returns {Record<string, number>}
 */
function mapHeaders(header) {
  const cols = parseCsvLine(header).map((h) => normalizeKey(h));
  /** @type {Record<string, number>} */
  const map = {};
  cols.forEach((col, i) => {
    map[col] = i;
  });
  return map;
}

/** @param {string} key */
function normalizeKey(key) {
  return key
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

/**
 * @param {string[]} cells
 * @param {Record<string, number>} headers
 * @param {string[]} keys
 */
function cell(cells, headers, keys) {
  for (const key of keys) {
    const idx = headers[key];
    if (idx != null && cells[idx] != null && cells[idx] !== '') {
      return cells[idx].trim();
    }
  }
  return '';
}

/** @param {string} raw */
function resolvePresetId(raw) {
  const key = raw.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return PRESET_ALIASES[key] ?? PRESET_ALIASES[key.replace(/\s+/g, ' ')] ?? null;
}

/**
 * @param {string} csvText
 * @returns {{ rows: CsvRow[], errors: string[] }}
 */
export function parseAgendaCsv(csvText) {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { rows: [], errors: ['Plik CSV jest pusty lub ma tylko nagłówek.'] };
  }

  const headers = mapHeaders(lines[0]);
  const nameKeys = ['imie', 'imię', 'name', 'mowca', 'mówca', 'speaker'];
  const typeKeys = ['typ', 'type', 'preset', 'rodzaj'];
  const a1Keys = ['agenda1', 'agenda_1', 'czas1', 'min', 'zielona'];
  const a2Keys = ['agenda2', 'agenda_2', 'czas2', 'opt', 'zolta', 'żółta'];
  const a3Keys = ['agenda3', 'agenda_3', 'czas3', 'max', 'czerwona'];

  /** @type {CsvRow[]} */
  const rows = [];
  /** @type {string[]} */
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const name = cell(cells, headers, nameKeys);
    const typeRaw = cell(cells, headers, typeKeys);

    if (!name) {
      errors.push(`Wiersz ${i + 1}: brak imienia.`);
      continue;
    }

    const presetId = resolvePresetId(typeRaw);
    if (!presetId) {
      errors.push(`Wiersz ${i + 1} (${name}): nieznany typ „${typeRaw || '(pusty)'}”.`);
      continue;
    }

    let customTimes = null;
    if (presetId === 'custom') {
      const t1 = parseTimeInput(cell(cells, headers, a1Keys));
      const t2 = parseTimeInput(cell(cells, headers, a2Keys));
      const t3 = parseTimeInput(cell(cells, headers, a3Keys));
      customTimes = { t1, t2, t3 };
      const validationError = validateCustomTimes(customTimes);
      if (validationError) {
        errors.push(`Wiersz ${i + 1} (${name}): ${validationError}`);
        continue;
      }
    }

    rows.push({ name, presetId, customTimes });
  }

  if (rows.length === 0 && errors.length === 0) {
    errors.push('Nie znaleziono poprawnych wierszy w CSV.');
  }

  return { rows, errors };
}
