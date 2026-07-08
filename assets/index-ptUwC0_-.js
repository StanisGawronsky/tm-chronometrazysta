(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`tm-chronometrazysta-session`;function t(e){return{id:crypto.randomUUID(),name:e,presetId:null,customTimes:null,phase:`idle`,elapsedMs:null,finishedAt:null,inRange:null,qualified:null,status:null}}function n(){return{speakers:[],activeSpeakerId:null}}function r(){try{let t=localStorage.getItem(e);if(!t)return n();let r=JSON.parse(t);return{speakers:Array.isArray(r.speakers)?r.speakers:[],activeSpeakerId:r.activeSpeakerId??null}}catch{return n()}}function i(t){localStorage.setItem(e,JSON.stringify(t))}function a(){i(n())}function o(e,n){let r=n.trim();if(!r)return{error:`Podaj imię mówcy.`};if(e.speakers.some(e=>e.name.toLowerCase()===r.toLowerCase()))return{error:`Mówca o tym imieniu już jest na liście.`};let a=t(r);return e.speakers.push(a),i(e),{speaker:a}}function s(e,t,n){let r=e.speakers.find(e=>e.id===t);!r||r.phase!==`idle`&&r.phase!==`finished`||(r.presetId=n,n===`custom`&&!r.customTimes&&(r.customTimes={t1:null,t2:null,t3:null}),n!==`custom`&&(r.customTimes=null),r.phase===`finished`&&(r.phase=`idle`,r.elapsedMs=null,r.finishedAt=null,r.inRange=null,r.qualified=null,r.status=null),i(e))}function c(e,t,n,r){let a=e.speakers.find(e=>e.id===t);!a||a.presetId!==`custom`||(a.customTimes||={t1:null,t2:null,t3:null},a.customTimes[n]=r,a.phase===`finished`&&(a.phase=`idle`,a.elapsedMs=null,a.finishedAt=null,a.inRange=null,a.qualified=null,a.status=null),i(e))}function l(e,t){e.activeSpeakerId=t,i(e)}function u(e,t,n){let r=e.speakers.find(e=>e.id===t);r&&(Object.assign(r,n),i(e))}function d(e,n){e.speakers=n.map(e=>{let n=t(e.name);return n.presetId=e.presetId,n.customTimes=e.presetId===`custom`?e.customTimes:null,n}),e.activeSpeakerId=null,i(e)}var f={speech_4_5_6:{id:`speech_4_5_6`,label:`Mowa 4–5–6`,green:240,yellow:300,red:360,grace:30},speech_5_6_7:{id:`speech_5_6_7`,label:`Mowa 5–6–7`,green:300,yellow:360,red:420,grace:30},speech_7_8_9:{id:`speech_7_8_9`,label:`Mowa 7–8–9`,green:420,yellow:480,red:540,grace:30},gp:{id:`gp`,label:`Gorące Pytania`,green:60,yellow:90,red:120,grace:30,prep:20,qualifyMin:60,qualifyMax:150},evaluation:{id:`evaluation`,label:`Ewaluacja (1 min)`,green:null,yellow:null,red:60,grace:0},custom:{id:`custom`,label:`Własne (agenda 1–2–3)`,green:null,yellow:null,red:0,grace:30}};function p(){return Object.values(f)}function m(e){let t=e.trim();if(!t)return null;if(t.includes(`:`)){let[e,n]=t.split(`:`),r=Number.parseInt(e,10),i=Number.parseInt(n,10);return Number.isNaN(r)||Number.isNaN(i)||i>=60||r<0||i<0?null:r*60+i}let n=Number.parseInt(t,10);return Number.isNaN(n)||n<0?null:n*60}function h(e){return e==null?``:b(e)}function g(e){return!e||e.t3==null?`Podaj czas z agendy 3 (czerwona flaga).`:e.t1!=null&&e.t2!=null&&e.t1>e.t2?`Agenda 1 nie może być później niż agenda 2.`:e.t2!=null&&e.t2>e.t3?`Agenda 2 nie może być później niż agenda 3.`:e.t1!=null&&e.t1>e.t3?`Agenda 1 nie może być później niż agenda 3.`:null}function _(e){let t=e.t1??null,n=e.t2??null,r=e.t3??0,i=[t,n,r].filter(e=>e!=null).map(e=>b(e));return{id:`custom`,label:i.length>0?`Własne (${i.join(` · `)})`:`Własne (agenda)`,green:t,yellow:n,red:r,grace:30}}function v(e){return e.presetId===`custom`?!e.customTimes||e.customTimes.t3==null||g(e.customTimes)?null:_(e.customTimes):y(e.presetId)}function y(e){return e?f[e]??null:null}function b(e){let t=Math.max(0,Math.floor(e));return`${Math.floor(t/60)}:${(t%60).toString().padStart(2,`0`)}`}function x(e){return b(e/1e3)}function S(e,t){let n=t/1e3;if(e.id===`gp`){let t=n>=e.qualifyMin&&n<=e.qualifyMax,r=`w ramach`;return n<e.qualifyMin?r=`za krótko`:n>e.qualifyMax&&(r=`za długo`),{inRange:t,qualified:t,status:r}}if(e.id===`evaluation`)return{inRange:!0,qualified:null,status:`w ramach`};let r=e.red+e.grace;if(e.green==null&&e.yellow==null){let e=`w ramach`;return n>r&&(e=`powyżej maksimum`),{inRange:n<=r,qualified:null,status:e}}let i=`w ramach`;return e.green!=null&&n<e.green?i=`poniżej minimum`:n>r&&(i=`powyżej maksimum`),{inRange:n>=(e.green??0)&&n<=r,qualified:null,status:i}}function C(e,t){let n=t/1e3;return e.id===`evaluation`?n>=e.red?`red`:`neutral`:n>=e.red?`red`:e.yellow!=null&&n>=e.yellow?`yellow`:e.green!=null&&n>=e.green?`green`:`neutral`}function w(e,t){let n=t/1e3;return n>=e.red&&n<e.red+e.grace}var T=`Przeanalizuj załączone zdjęcie agendy spotkania Toastmasters i wygeneruj WYŁĄCZNIE plik CSV (bez komentarzy, bez markdown).

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
Maria,ewaluacja,,,`,E={gp:`gp`,"gorace pytania":`gp`,"gorące pytania":`gp`,gorace_pytania:`gp`,ewaluacja:`evaluation`,evaluation:`evaluation`,mowa:`custom`,custom:`custom`,wlasne:`custom`,własne:`custom`,speech_4_5_6:`speech_4_5_6`,"4-5-6":`speech_4_5_6`,"mowa 4-5-6":`speech_4_5_6`,speech_5_6_7:`speech_5_6_7`,"5-6-7":`speech_5_6_7`,"mowa 5-6-7":`speech_5_6_7`,speech_7_8_9:`speech_7_8_9`,"7-8-9":`speech_7_8_9`,"mowa 7-8-9":`speech_7_8_9`};function D(e){let t=[],n=``,r=!1;for(let i=0;i<e.length;i++){let a=e[i];if(a===`"`){r&&e[i+1]===`"`?(n+=`"`,i++):r=!r;continue}if((a===`,`||a===`;`)&&!r){t.push(n.trim()),n=``;continue}n+=a}return t.push(n.trim()),t}function O(e){let t=D(e).map(e=>k(e)),n={};return t.forEach((e,t)=>{n[e]=t}),n}function k(e){return e.trim().toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/\s+/g,`_`)}function A(e,t,n){for(let r of n){let n=t[r];if(n!=null&&e[n]!=null&&e[n]!==``)return e[n].trim()}return``}function j(e){let t=e.trim().toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``);return E[t]??E[t.replace(/\s+/g,` `)]??null}function M(e){let t=e.replace(/^\uFEFF/,``).split(/\r?\n/).map(e=>e.trim()).filter(e=>e.length>0);if(t.length<2)return{rows:[],errors:[`Plik CSV jest pusty lub ma tylko nagłówek.`]};let n=O(t[0]),r=[`imie`,`imię`,`name`,`mowca`,`mówca`,`speaker`],i=[`typ`,`type`,`preset`,`rodzaj`],a=[`agenda1`,`agenda_1`,`czas1`,`min`,`zielona`],o=[`agenda2`,`agenda_2`,`czas2`,`opt`,`zolta`,`żółta`],s=[`agenda3`,`agenda_3`,`czas3`,`max`,`czerwona`],c=[],l=[];for(let e=1;e<t.length;e++){let u=D(t[e]),d=A(u,n,r),f=A(u,n,i);if(!d){l.push(`Wiersz ${e+1}: brak imienia.`);continue}let p=j(f);if(!p){l.push(`Wiersz ${e+1} (${d}): nieznany typ „${f||`(pusty)`}”.`);continue}let h=null;if(p===`custom`){h={t1:m(A(u,n,a)),t2:m(A(u,n,o)),t3:m(A(u,n,s))};let t=g(h);if(t){l.push(`Wiersz ${e+1} (${d}): ${t}`);continue}}c.push({name:d,presetId:p,customTimes:h})}return c.length===0&&l.length===0&&l.push(`Nie znaleziono poprawnych wierszy w CSV.`),{rows:c,errors:l}}function N(e,t={}){let n=`idle`,r=0,i=e.prep?e.prep*1e3:0,a=null,o=`neutral`,s=!1;function c(){return{phase:n,mainElapsedMs:r,prepRemainingMs:i,flag:o,inGrace:s}}function l(){t.onTick?.(c())}function u(){let n=C(e,r),i=w(e,r);(n!==o||i!==s)&&(o=n,s=i,t.onFlagChange?.(o,s))}function d(){if(n===`prep`){i=Math.max(0,i-100),i===0&&(n=`running`),l();return}if(n===`running`||n===`grace`){r+=100;let t=w(e,r);t&&n===`running`&&(n=`grace`),!t&&n===`grace`&&e.grace>0&&(n=`running`),s=t,u(),l()}}function f(){p(),a=setInterval(d,100)}function p(){a&&=(clearInterval(a),null)}return{getState:c,start(){if(!(n===`running`||n===`prep`||n===`grace`)){if(e.prep&&n===`idle`){n=`prep`,i=e.prep*1e3,f(),l();return}n=`running`,f(),l()}},pause(){n!==`running`&&n!==`prep`&&n!==`grace`||(p(),n=`paused`,l())},resume(){n===`paused`&&(n=e.prep&&i>0?`prep`:w(e,r)?`grace`:`running`,f(),l())},stop(){return p(),n=`finished`,u(),l(),r},reset(){p(),n=`idle`,r=0,i=e.prep?e.prep*1e3:0,o=`neutral`,s=!1,l()},destroy(){p()}}}function P(e){let t=e.filter(e=>e.elapsedMs!=null);if(t.length===0)return{lines:[],text:`Brak zakończonych wystąpień.`};let n=t.map(e=>{let t=x(e.elapsedMs),n=e.status??`—`;return`${e.name} — ${t} — ${n}`}),r=t.every(e=>e.inRange!==!1)?`Spotkanie przebiegło zgodnie z agendą.`:`Część wystąpień wymagała uwagi czasowej.`,i=t.filter(e=>y(e.presetId)?.id===`gp`),a=i.length>0?`\nGorące Pytania — kwalifikacja: ${i.map(e=>`${e.name} (${e.qualified?`tak`:`nie`})`).join(`, `)}.`:``;return{lines:n,text:[`Raport chronometrażysty`,``,r,``,`Czasy mówców:`,...n.map(e=>`- ${e}`),a,``,`Rada: gdy widzicie żółtą flagę — czas na pointę. Czerwona to jeszcze 30 sekund na domknięcie.`].filter(Boolean).join(`
`)}}function F(e){let{lines:t}=P(e),n=e.filter(e=>e.elapsedMs!=null);return n.length===0?`<p class="report-empty">Brak zakończonych wystąpień.</p>`:`<ul class="report-list">${n.map(e=>{let t=e.inRange===!1?`badge-bad`:`badge-ok`,n=e.status??`—`;return`<li><strong>${I(e.name)}</strong> — ${x(e.elapsedMs)} — <span class="badge ${t}">${I(n)}</span></li>`}).join(``)}</ul>`}function I(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`)}function L(e,t,n,r){let i=p(),a=t.activeSpeakerId,o=a!=null;e.innerHTML=`
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

      ${t.speakers.length===0?ee():``}

      <p class="error-msg hidden" data-el="error"></p>

      <section class="speakers" data-el="speakers">
        ${t.speakers.map(e=>te(e,i,a,o)).join(``)}
      </section>

      <section class="report-section">
        <h2>Raport</h2>
        ${F(t.speakers)}
        <button type="button" class="btn btn-secondary" data-action="copy-report">Kopiuj raport</button>
        <p class="copy-toast hidden" data-el="copy-toast">Skopiowano!</p>
        <p class="copy-toast hidden" data-el="prompt-toast">Prompt skopiowany!</p>
      </section>
    </div>
  `,z(e,r),e.querySelector(`[data-action="new-meeting"]`)?.addEventListener(`click`,n.onNewMeeting);let s=e.querySelector(`[data-input="speaker-name"]`),c=e.querySelector(`[data-action="add-speaker"]`),l=()=>{s instanceof HTMLInputElement&&(n.onAddSpeaker(s.value),s.value=``,s.focus())};c?.addEventListener(`click`,l),s?.addEventListener(`keydown`,e=>{e.key===`Enter`&&l()});let u=e.querySelector(`[data-input="csv-file"]`);e.querySelector(`[data-action="import-csv"]`)?.addEventListener(`click`,()=>{u instanceof HTMLInputElement&&u.click()}),u?.addEventListener(`change`,e=>{let t=e.target;!(t instanceof HTMLInputElement)||!t.files?.[0]||(n.onImportCsv(t.files[0]),t.value=``)}),e.querySelector(`[data-action="copy-ai-prompt"]`)?.addEventListener(`click`,n.onCopyAiPrompt),e.querySelector(`[data-action="copy-report"]`)?.addEventListener(`click`,n.onCopyReport),e.querySelectorAll(`[data-preset]`).forEach(e=>{e.addEventListener(`change`,e=>{let t=e.target;if(!(t instanceof HTMLSelectElement))return;let r=t.dataset.speakerId;r&&n.onPresetChange(r,t.value)})}),e.querySelectorAll(`[data-custom-time]`).forEach(e=>{if(!(e instanceof HTMLInputElement))return;let t=e.dataset.speakerId,r=e.dataset.customTime;if(!t||!r)return;let i=()=>{n.onCustomTimeChange(t,r,e.value)};e.addEventListener(`change`,i),e.addEventListener(`blur`,i)}),e.querySelectorAll(`[data-action]`).forEach(e=>{if(!(e instanceof HTMLButtonElement))return;let t=e.dataset.action,r=e.dataset.speakerId;!r||!t||(t===`start`&&e.addEventListener(`click`,()=>n.onStart(r)),t===`pause`&&e.addEventListener(`click`,()=>n.onPause(r)),t===`resume`&&e.addEventListener(`click`,()=>n.onResume(r)),t===`stop`&&e.addEventListener(`click`,()=>n.onStop(r)))})}function ee(){return`
    <section class="empty-agenda">
      <p class="empty">Brak mówców na agendzie. Dodaj ręcznie (+) lub wgraj CSV.</p>
      <div class="empty-agenda-actions">
        <input type="file" accept=".csv,text/csv" class="hidden" data-input="csv-file" />
        <button type="button" class="btn btn-secondary btn-lg" data-action="import-csv">Wgraj CSV</button>
        <button type="button" class="btn btn-ghost btn-lg" data-action="copy-ai-prompt">Kopiuj prompt AI</button>
      </div>
      <p class="empty-agenda-hint">Prompt AI opisuje format CSV do wygenerowania ze zdjęcia agendy.</p>
    </section>
  `}function te(e,t,n,r){let i=e.id===n,a=r&&!i&&e.phase!==`finished`,o=(v(e)??y(e.presetId))&&(e.phase===`idle`||e.phase===`finished`),s=e.phase===`running`||e.phase===`prep`||e.phase===`grace`,c=e.phase===`paused`,l=e.phase===`finished`&&e.elapsedMs!=null,u=t.map(t=>`<option value="${t.id}" ${e.presetId===t.id?`selected`:``}>${t.label}</option>`).join(``),d=l?x(e.elapsedMs):e.liveTime??`0:00`,f=e.phase===`prep`&&e.prepRemaining!=null?`<p class="prep-label">Przygotowanie: ${Math.ceil(e.prepRemaining/1e3)} s</p>`:``,p=e.inGrace&&s?`<p class="grace-label">+30 s po czerwonej</p>`:``,m=l?`<span class="badge ${e.inRange===!1?`badge-bad`:`badge-ok`}">${e.status??`—`}</span>`:``,h={idle:`Gotowy`,prep:`Przygotowanie`,running:`Trwa`,paused:`Pauza`,grace:`Czerwona + grace`,finished:`Zakończono`}[e.phase]??``;return`
    <article class="speaker-card ${i?`is-active`:``} ${a?`is-locked`:``}" data-speaker-id="${e.id}">
      <div class="speaker-head">
        <h3>${W(e.name)}</h3>
        <span class="phase-tag">${h}</span>
      </div>

      <label class="preset-label">
        Typ wystąpienia
        <select class="select" data-preset data-speaker-id="${e.id}" ${s||c?`disabled`:``}>
          <option value="">— wybierz —</option>
          ${u}
        </select>
      </label>

      ${e.presetId===`custom`?R(e,s||c):``}

      ${f}
      <p class="timer-display" data-timer="${e.id}">${d}</p>
      ${p}
      ${m}

      <div class="controls">
        ${o&&!s&&!c?`<button type="button" class="btn btn-primary btn-lg" data-action="start" data-speaker-id="${e.id}" ${a?`disabled`:``}>Start</button>`:``}
        ${s?`<button type="button" class="btn btn-secondary btn-lg" data-action="pause" data-speaker-id="${e.id}">Pauza</button>`:``}
        ${c?`<button type="button" class="btn btn-primary btn-lg" data-action="resume" data-speaker-id="${e.id}">Wznów</button>`:``}
        ${s||c?`<button type="button" class="btn btn-danger btn-lg" data-action="stop" data-speaker-id="${e.id}">Stop</button>`:``}
      </div>
    </article>
  `}function R(e,t){let n=e.customTimes??{t1:null,t2:null,t3:null};return`
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
            data-speaker-id="${e.id}"
            value="${h(n.t1)}"
            ${t?`disabled`:``}
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
            data-speaker-id="${e.id}"
            value="${h(n.t2)}"
            ${t?`disabled`:``}
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
            data-speaker-id="${e.id}"
            value="${h(n.t3)}"
            ${t?`disabled`:``}
            required
          />
        </label>
      </div>
    </div>
  `}function z(e,t){let n=document.body;if(n.classList.remove(`bg-neutral`,`bg-green`,`bg-yellow`,`bg-red`,`bg-blink`,`bg-blink-fast`),!t.active){n.classList.add(`bg-neutral`);return}n.classList.add(`bg-${t.flag}`),n.classList.add(t.inGrace?`bg-blink-fast`:`bg-blink`)}function B(e,t){let n=e.querySelector(`[data-el="error"]`);if(n instanceof HTMLElement){if(!t){n.textContent=``,n.classList.add(`hidden`);return}n.textContent=t,n.classList.remove(`hidden`)}}function V(e){U(e,`copy-toast`)}function H(e){U(e,`prompt-toast`)}function U(e,t){let n=e.querySelector(`[data-el="${t}"]`);n instanceof HTMLElement&&(n.classList.remove(`hidden`),setTimeout(()=>n.classList.add(`hidden`),2e3))}function W(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`)}function G(e,t,n,r={}){let i=e.querySelector(`[data-timer="${t}"]`);i&&(i.textContent=n);let a=e.querySelector(`[data-speaker-id="${t}"]`);if(!(a instanceof HTMLElement))return;let o=a.querySelector(`.prep-label`);r.prepRemaining!=null&&r.prepRemaining>0?(o||(o=document.createElement(`p`),o.className=`prep-label`,a.querySelector(`.timer-display`)?.before(o)),o.textContent=`Przygotowanie: ${Math.ceil(r.prepRemaining/1e3)} s`):o&&o.remove();let s=a.querySelector(`.grace-label`);r.inGrace?(s||(s=document.createElement(`p`),s.className=`grace-label`,a.querySelector(`.timer-display`)?.after(s)),s.textContent=`+30 s po czerwonej`):s&&s.remove()}var K=document.getElementById(`app`);if(!K)throw Error(`#app not found`);var q=r(),J=null,Y=null,X={flag:`neutral`,inGrace:!1,active:!1};function Z(){let e=q.speakers.map(e=>{if(e.id===Y&&J){let t=J.getState();return{...e,phase:t.phase,liveTime:x(t.mainElapsedMs),prepRemaining:t.prepRemainingMs,inGrace:t.inGrace}}return e});L(K,{...q,speakers:e},{onAddSpeaker:ne,onNewMeeting:re,onImportCsv:ie,onCopyAiPrompt:ae,onPresetChange:se,onCustomTimeChange:Q,onStart:ce,onPause:le,onResume:ue,onStop:de,onCopyReport:fe},X)}function ne(e){let t=o(q,e);if(t.error){Z(),B(K,t.error);return}B(K,``),Z()}function re(){confirm(`Wyczyścić bieżącą sesję i zacząć od nowa?`)&&($(),a(),q=r(),X.active=!1,X.flag=`neutral`,X.inGrace=!1,Z())}async function ie(e){if(q.speakers.length>0){B(K,`Import CSV dostępny tylko przy pustej agendzie.`);return}try{let{rows:t,errors:n}=M(await e.text());if(t.length===0){B(K,n.join(` `)||`Nie udało się wczytać CSV.`),Z();return}d(q,t);let r=n.length>0?` (${n.length} wierszy pominięto)`:``;B(K,n.length>0?n.slice(0,3).join(` `)+r:``),n.length===0&&B(K,``),Z()}catch{B(K,`Nie udało się odczytać pliku CSV.`),Z()}}async function ae(){try{await navigator.clipboard.writeText(T),H(K)}catch{let e=document.createElement(`textarea`);e.value=T,document.body.appendChild(e),e.select(),document.execCommand(`copy`),document.body.removeChild(e),H(K)}}async function oe(e){try{await navigator.clipboard.writeText(e)}catch{let t=document.createElement(`textarea`);t.value=e,document.body.appendChild(t),t.select(),document.execCommand(`copy`),document.body.removeChild(t)}}function se(e,t){t&&(s(q,e,t),B(K,``),Z())}function Q(e,t,n){let r=m(n);if(n.trim()&&r==null){B(K,`Niepoprawny format czasu. Użyj np. 5:00 lub 5.`);return}c(q,e,t,r);let i=q.speakers.find(t=>t.id===e);B(K,(i?.customTimes?g(i.customTimes):null)??``),Z()}function $(){J?.destroy(),J=null,Y=null,X.active=!1,X.flag=`neutral`,X.inGrace=!1}function ce(e){let t=q.speakers.find(t=>t.id===e);if(!t)return;let n=v(t);if(!n){B(K,t.presetId===`custom`?`Ustaw czasy z agendy (wymagana agenda 3).`:`Wybierz typ wystąpienia przed startem.`),Z();return}if(t.presetId===`custom`){let e=g(t.customTimes);if(e){B(K,e),Z();return}}q.activeSpeakerId&&q.activeSpeakerId!==e||($(),Y=e,l(q,e),u(q,e,{phase:n.prep?`prep`:`running`,elapsedMs:null,finishedAt:null,inRange:null,qualified:null,status:null}),J=N(n,{onTick:t=>{u(q,e,{phase:t.phase}),G(K,e,x(t.mainElapsedMs),{prepRemaining:t.prepRemainingMs,inGrace:t.inGrace})},onFlagChange:(e,t)=>{X.active=!0,X.flag=e,X.inGrace=t,z(K,X)}}),X.active=!0,J.start(),Z())}function le(e){Y!==e||!J||(J.pause(),u(q,e,{phase:`paused`}),X.active=!1,z(K,X),Z())}function ue(e){if(Y!==e||!J)return;J.resume();let t=J.getState();u(q,e,{phase:t.phase}),X.active=!0,X.flag=t.flag,X.inGrace=t.inGrace,z(K,X),Z()}function de(e){if(Y!==e||!J)return;let t=q.speakers.find(t=>t.id===e),n=v(t);if(!n||!t)return;let r=J.stop(),i=S(n,r);u(q,e,{phase:`finished`,elapsedMs:r,finishedAt:new Date().toISOString(),inRange:i.inRange,qualified:i.qualified,status:i.status}),$(),l(q,null),Z()}async function fe(){let{text:e}=P(q.speakers);await oe(e),V(K)}Z();