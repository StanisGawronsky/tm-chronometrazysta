# TM Chronometrażysta

Miniaplikacja dla chronometrażysty Toastmasters Poznań — stoper z flagami, presetami TM i raportem końcowym.

## Funkcje

- Dodawanie mówców (input + przycisk **+**)
- Presety: Mowa 4–5–6, 5–6–7, 7–8–9, Gorące Pytania, Ewaluacja
- **Własne czasy** — agenda 1 (zielona), 2 (żółta), 3 (czerwona) z formatu `5:00` lub `5`
- **Import CSV** — przy pustej agendzie: wgraj plik lub skopiuj prompt AI do wygenerowania CSV ze zdjęcia agendy
- Sterowanie: Start / Pauza / Wznów / Stop
- Sygnalizacja flag: tło aplikacji zmienia kolor i miga (zielona / żółta / czerwona + grace)
- Gorące Pytania: 20 s przygotowania, kwalifikacja 1:00–2:30
- Raport końcowy z przyciskiem **Kopiuj raport**
- Sesja zapisywana w `localStorage`

## Lokalnie

```bash
npm install
npm run dev
```

Otwórz adres z terminala (domyślnie `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Deploy na GitHub Pages (faza 2)

1. Utwórz repo `tm-chronometrazysta` na GitHubie i wypchnij kod.
2. W `vite.config.js` ustaw `base` na nazwę repo:

```js
export default defineConfig({
  base: '/tm-chronometrazysta/',
});
```

3. Zbuduj i wgraj `dist`:

```bash
npm run build
npx gh-pages -d dist
```

Alternatywnie: GitHub Actions → Settings → Pages → „Deploy from branch” (`gh-pages`).

Aplikacja będzie dostępna pod: `https://<user>.github.io/tm-chronometrazysta/`

## Użycie na spotkaniu

1. Dodaj mówców z agendy.
2. Dla każdego wybierz typ wystąpienia.
3. Kliknij **Start** — trzymaj telefon tak, by widzieć migające tło.
4. Po wystąpieniu **Stop** — czas trafia do raportu.
5. Na koniec spotkania **Kopiuj raport** i odczytaj na scenie.

Jednocześnie może działać tylko jeden aktywny timer.

## Format CSV agendy

```csv
imie,typ,agenda1,agenda2,agenda3
Ania,mowa,5:00,6:00,7:00
Jan,gp,,,
Piotr,ewaluacja,,,
```

Typy: `mowa`, `gp`, `ewaluacja`, `speech_4_5_6`, `speech_5_6_7`, `speech_7_8_9`.

Przy pustej agendzie użyj **Kopiuj prompt AI** — wklej do ChatGPT/Claude wraz ze zdjęciem agendy.
