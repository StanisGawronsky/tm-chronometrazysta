(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`tm-chronometrazysta-session`;function t(e){return{id:crypto.randomUUID(),name:e,presetId:null,customTimes:null,phase:`idle`,elapsedMs:null,finishedAt:null,inRange:null,qualified:null,status:null}}function n(){return{speakers:[],activeSpeakerId:null}}function r(){try{let t=localStorage.getItem(e);if(!t)return n();let r=JSON.parse(t);return{speakers:Array.isArray(r.speakers)?r.speakers:[],activeSpeakerId:r.activeSpeakerId??null}}catch{return n()}}function i(t){localStorage.setItem(e,JSON.stringify(t))}function a(){i(n())}function o(e,n){let r=n.trim();if(!r)return{error:`Podaj imię mówcy.`};if(e.speakers.some(e=>e.name.toLowerCase()===r.toLowerCase()))return{error:`Mówca o tym imieniu już jest na liście.`};let a=t(r);return e.speakers.push(a),i(e),{speaker:a}}function s(e,t,n){let r=e.speakers.find(e=>e.id===t);!r||r.phase!==`idle`&&r.phase!==`finished`||(r.presetId=n,n===`custom`&&!r.customTimes&&(r.customTimes={t1:null,t2:null,t3:null}),n!==`custom`&&(r.customTimes=null),r.phase===`finished`&&(r.phase=`idle`,r.elapsedMs=null,r.finishedAt=null,r.inRange=null,r.qualified=null,r.status=null),i(e))}function c(e,t,n,r){let a=e.speakers.find(e=>e.id===t);!a||a.presetId!==`custom`||(a.customTimes||={t1:null,t2:null,t3:null},a.customTimes[n]=r,a.phase===`finished`&&(a.phase=`idle`,a.elapsedMs=null,a.finishedAt=null,a.inRange=null,a.qualified=null,a.status=null),i(e))}function l(e,t){e.activeSpeakerId=t,i(e)}function u(e,t,n){let r=e.speakers.find(e=>e.id===t);r&&(Object.assign(r,n),i(e))}var d={speech_4_5_6:{id:`speech_4_5_6`,label:`Mowa 4–5–6`,green:240,yellow:300,red:360,grace:30},speech_5_6_7:{id:`speech_5_6_7`,label:`Mowa 5–6–7`,green:300,yellow:360,red:420,grace:30},speech_7_8_9:{id:`speech_7_8_9`,label:`Mowa 7–8–9`,green:420,yellow:480,red:540,grace:30},gp:{id:`gp`,label:`Gorące Pytania`,green:60,yellow:90,red:120,grace:30,prep:20,qualifyMin:60,qualifyMax:150},evaluation:{id:`evaluation`,label:`Ewaluacja (1 min)`,green:null,yellow:null,red:60,grace:0},custom:{id:`custom`,label:`Własne (agenda 1–2–3)`,green:null,yellow:null,red:0,grace:30}};function f(){return Object.values(d)}function p(e){let t=e.trim();if(!t)return null;if(t.includes(`:`)){let[e,n]=t.split(`:`),r=Number.parseInt(e,10),i=Number.parseInt(n,10);return Number.isNaN(r)||Number.isNaN(i)||i>=60||r<0||i<0?null:r*60+i}let n=Number.parseInt(t,10);return Number.isNaN(n)||n<0?null:n*60}function m(e){return e==null?``:y(e)}function h(e){return!e||e.t3==null?`Podaj czas z agendy 3 (czerwona flaga).`:e.t1!=null&&e.t2!=null&&e.t1>e.t2?`Agenda 1 nie może być później niż agenda 2.`:e.t2!=null&&e.t2>e.t3?`Agenda 2 nie może być później niż agenda 3.`:e.t1!=null&&e.t1>e.t3?`Agenda 1 nie może być później niż agenda 3.`:null}function g(e){let t=e.t1??null,n=e.t2??null,r=e.t3??0,i=[t,n,r].filter(e=>e!=null).map(e=>y(e));return{id:`custom`,label:i.length>0?`Własne (${i.join(` · `)})`:`Własne (agenda)`,green:t,yellow:n,red:r,grace:30}}function _(e){return e.presetId===`custom`?!e.customTimes||e.customTimes.t3==null||h(e.customTimes)?null:g(e.customTimes):v(e.presetId)}function v(e){return e?d[e]??null:null}function y(e){let t=Math.max(0,Math.floor(e));return`${Math.floor(t/60)}:${(t%60).toString().padStart(2,`0`)}`}function b(e){return y(e/1e3)}function x(e,t){let n=t/1e3;if(e.id===`gp`){let t=n>=e.qualifyMin&&n<=e.qualifyMax,r=`w ramach`;return n<e.qualifyMin?r=`za krótko`:n>e.qualifyMax&&(r=`za długo`),{inRange:t,qualified:t,status:r}}if(e.id===`evaluation`)return{inRange:!0,qualified:null,status:`w ramach`};let r=e.red+e.grace;if(e.green==null&&e.yellow==null){let e=`w ramach`;return n>r&&(e=`powyżej maksimum`),{inRange:n<=r,qualified:null,status:e}}let i=`w ramach`;return e.green!=null&&n<e.green?i=`poniżej minimum`:n>r&&(i=`powyżej maksimum`),{inRange:n>=(e.green??0)&&n<=r,qualified:null,status:i}}function S(e,t){let n=t/1e3;return e.id===`evaluation`?n>=e.red?`red`:`neutral`:n>=e.red?`red`:e.yellow!=null&&n>=e.yellow?`yellow`:e.green!=null&&n>=e.green?`green`:`neutral`}function C(e,t){let n=t/1e3;return n>=e.red&&n<e.red+e.grace}function w(e,t={}){let n=`idle`,r=0,i=e.prep?e.prep*1e3:0,a=null,o=`neutral`,s=!1;function c(){return{phase:n,mainElapsedMs:r,prepRemainingMs:i,flag:o,inGrace:s}}function l(){t.onTick?.(c())}function u(){let n=S(e,r),i=C(e,r);(n!==o||i!==s)&&(o=n,s=i,t.onFlagChange?.(o,s))}function d(){if(n===`prep`){i=Math.max(0,i-100),i===0&&(n=`running`),l();return}if(n===`running`||n===`grace`){r+=100;let t=C(e,r);t&&n===`running`&&(n=`grace`),!t&&n===`grace`&&e.grace>0&&(n=`running`),s=t,u(),l()}}function f(){p(),a=setInterval(d,100)}function p(){a&&=(clearInterval(a),null)}return{getState:c,start(){if(!(n===`running`||n===`prep`||n===`grace`)){if(e.prep&&n===`idle`){n=`prep`,i=e.prep*1e3,f(),l();return}n=`running`,f(),l()}},pause(){n!==`running`&&n!==`prep`&&n!==`grace`||(p(),n=`paused`,l())},resume(){n===`paused`&&(n=e.prep&&i>0?`prep`:C(e,r)?`grace`:`running`,f(),l())},stop(){return p(),n=`finished`,u(),l(),r},reset(){p(),n=`idle`,r=0,i=e.prep?e.prep*1e3:0,o=`neutral`,s=!1,l()},destroy(){p()}}}function T(e){let t=e.filter(e=>e.elapsedMs!=null);if(t.length===0)return{lines:[],text:`Brak zakończonych wystąpień.`};let n=t.map(e=>{let t=b(e.elapsedMs),n=e.status??`—`;return`${e.name} — ${t} — ${n}`}),r=t.every(e=>e.inRange!==!1)?`Spotkanie przebiegło zgodnie z agendą.`:`Część wystąpień wymagała uwagi czasowej.`,i=t.filter(e=>v(e.presetId)?.id===`gp`),a=i.length>0?`\nGorące Pytania — kwalifikacja: ${i.map(e=>`${e.name} (${e.qualified?`tak`:`nie`})`).join(`, `)}.`:``;return{lines:n,text:[`Raport chronometrażysty`,``,r,``,`Czasy mówców:`,...n.map(e=>`- ${e}`),a,``,`Rada: gdy widzicie żółtą flagę — czas na pointę. Czerwona to jeszcze 30 sekund na domknięcie.`].filter(Boolean).join(`
`)}}function E(e){let{lines:t}=T(e),n=e.filter(e=>e.elapsedMs!=null);return n.length===0?`<p class="report-empty">Brak zakończonych wystąpień.</p>`:`<ul class="report-list">${n.map(e=>{let t=e.inRange===!1?`badge-bad`:`badge-ok`,n=e.status??`—`;return`<li><strong>${D(e.name)}</strong> — ${b(e.elapsedMs)} — <span class="badge ${t}">${D(n)}</span></li>`}).join(``)}</ul>`}function D(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`)}function O(e,t,n,r){let i=f(),a=t.activeSpeakerId,o=a!=null;e.innerHTML=`
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
        ${t.speakers.length===0?`<p class="empty">Dodaj mówców przyciskiem +</p>`:``}
        ${t.speakers.map(e=>k(e,i,a,o)).join(``)}
      </section>

      <section class="report-section">
        <h2>Raport</h2>
        ${E(t.speakers)}
        <button type="button" class="btn btn-secondary" data-action="copy-report">Kopiuj raport</button>
        <p class="copy-toast hidden" data-el="copy-toast">Skopiowano!</p>
      </section>
    </div>
  `,j(e,r),e.querySelector(`[data-action="new-meeting"]`)?.addEventListener(`click`,n.onNewMeeting);let s=e.querySelector(`[data-input="speaker-name"]`),c=e.querySelector(`[data-action="add-speaker"]`),l=()=>{s instanceof HTMLInputElement&&(n.onAddSpeaker(s.value),s.value=``,s.focus())};c?.addEventListener(`click`,l),s?.addEventListener(`keydown`,e=>{e.key===`Enter`&&l()}),e.querySelector(`[data-action="copy-report"]`)?.addEventListener(`click`,n.onCopyReport),e.querySelectorAll(`[data-preset]`).forEach(e=>{e.addEventListener(`change`,e=>{let t=e.target;if(!(t instanceof HTMLSelectElement))return;let r=t.dataset.speakerId;r&&n.onPresetChange(r,t.value)})}),e.querySelectorAll(`[data-custom-time]`).forEach(e=>{if(!(e instanceof HTMLInputElement))return;let t=e.dataset.speakerId,r=e.dataset.customTime;if(!t||!r)return;let i=()=>{n.onCustomTimeChange(t,r,e.value)};e.addEventListener(`change`,i),e.addEventListener(`blur`,i)}),e.querySelectorAll(`[data-action]`).forEach(e=>{if(!(e instanceof HTMLButtonElement))return;let t=e.dataset.action,r=e.dataset.speakerId;!r||!t||(t===`start`&&e.addEventListener(`click`,()=>n.onStart(r)),t===`pause`&&e.addEventListener(`click`,()=>n.onPause(r)),t===`resume`&&e.addEventListener(`click`,()=>n.onResume(r)),t===`stop`&&e.addEventListener(`click`,()=>n.onStop(r)))})}function k(e,t,n,r){let i=e.id===n,a=r&&!i&&e.phase!==`finished`,o=(_(e)??v(e.presetId))&&(e.phase===`idle`||e.phase===`finished`),s=e.phase===`running`||e.phase===`prep`||e.phase===`grace`,c=e.phase===`paused`,l=e.phase===`finished`&&e.elapsedMs!=null,u=t.map(t=>`<option value="${t.id}" ${e.presetId===t.id?`selected`:``}>${t.label}</option>`).join(``),d=l?b(e.elapsedMs):e.liveTime??`0:00`,f=e.phase===`prep`&&e.prepRemaining!=null?`<p class="prep-label">Przygotowanie: ${Math.ceil(e.prepRemaining/1e3)} s</p>`:``,p=e.inGrace&&s?`<p class="grace-label">+30 s po czerwonej</p>`:``,m=l?`<span class="badge ${e.inRange===!1?`badge-bad`:`badge-ok`}">${e.status??`—`}</span>`:``,h={idle:`Gotowy`,prep:`Przygotowanie`,running:`Trwa`,paused:`Pauza`,grace:`Czerwona + grace`,finished:`Zakończono`}[e.phase]??``;return`
    <article class="speaker-card ${i?`is-active`:``} ${a?`is-locked`:``}" data-speaker-id="${e.id}">
      <div class="speaker-head">
        <h3>${P(e.name)}</h3>
        <span class="phase-tag">${h}</span>
      </div>

      <label class="preset-label">
        Typ wystąpienia
        <select class="select" data-preset data-speaker-id="${e.id}" ${s||c?`disabled`:``}>
          <option value="">— wybierz —</option>
          ${u}
        </select>
      </label>

      ${e.presetId===`custom`?A(e,s||c):``}

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
  `}function A(e,t){let n=e.customTimes??{t1:null,t2:null,t3:null};return`
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
            value="${m(n.t1)}"
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
            value="${m(n.t2)}"
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
            value="${m(n.t3)}"
            ${t?`disabled`:``}
            required
          />
        </label>
      </div>
    </div>
  `}function j(e,t){let n=document.body;if(n.classList.remove(`bg-neutral`,`bg-green`,`bg-yellow`,`bg-red`,`bg-blink`,`bg-blink-fast`),!t.active){n.classList.add(`bg-neutral`);return}n.classList.add(`bg-${t.flag}`),n.classList.add(t.inGrace?`bg-blink-fast`:`bg-blink`)}function M(e,t){let n=e.querySelector(`[data-el="error"]`);if(n instanceof HTMLElement){if(!t){n.textContent=``,n.classList.add(`hidden`);return}n.textContent=t,n.classList.remove(`hidden`)}}function N(e){let t=e.querySelector(`[data-el="copy-toast"]`);t instanceof HTMLElement&&(t.classList.remove(`hidden`),setTimeout(()=>t.classList.add(`hidden`),2e3))}function P(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`)}function F(e,t,n,r={}){let i=e.querySelector(`[data-timer="${t}"]`);i&&(i.textContent=n);let a=e.querySelector(`[data-speaker-id="${t}"]`);if(!(a instanceof HTMLElement))return;let o=a.querySelector(`.prep-label`);r.prepRemaining!=null&&r.prepRemaining>0?(o||(o=document.createElement(`p`),o.className=`prep-label`,a.querySelector(`.timer-display`)?.before(o)),o.textContent=`Przygotowanie: ${Math.ceil(r.prepRemaining/1e3)} s`):o&&o.remove();let s=a.querySelector(`.grace-label`);r.inGrace?(s||(s=document.createElement(`p`),s.className=`grace-label`,a.querySelector(`.timer-display`)?.after(s)),s.textContent=`+30 s po czerwonej`):s&&s.remove()}var I=document.getElementById(`app`);if(!I)throw Error(`#app not found`);var L=r(),R=null,z=null,B={flag:`neutral`,inGrace:!1,active:!1};function V(){let e=L.speakers.map(e=>{if(e.id===z&&R){let t=R.getState();return{...e,phase:t.phase,liveTime:b(t.mainElapsedMs),prepRemaining:t.prepRemainingMs,inGrace:t.inGrace}}return e});O(I,{...L,speakers:e},{onAddSpeaker:H,onNewMeeting:U,onPresetChange:W,onCustomTimeChange:G,onStart:q,onPause:J,onResume:Y,onStop:X,onCopyReport:Z},B)}function H(e){let t=o(L,e);if(t.error){V(),M(I,t.error);return}M(I,``),V()}function U(){confirm(`Wyczyścić bieżącą sesję i zacząć od nowa?`)&&(K(),a(),L=r(),B.active=!1,B.flag=`neutral`,B.inGrace=!1,V())}function W(e,t){t&&(s(L,e,t),M(I,``),V())}function G(e,t,n){let r=p(n);if(n.trim()&&r==null){M(I,`Niepoprawny format czasu. Użyj np. 5:00 lub 5.`);return}c(L,e,t,r);let i=L.speakers.find(t=>t.id===e);M(I,(i?.customTimes?h(i.customTimes):null)??``),V()}function K(){R?.destroy(),R=null,z=null,B.active=!1,B.flag=`neutral`,B.inGrace=!1}function q(e){let t=L.speakers.find(t=>t.id===e);if(!t)return;let n=_(t);if(!n){M(I,t.presetId===`custom`?`Ustaw czasy z agendy (wymagana agenda 3).`:`Wybierz typ wystąpienia przed startem.`),V();return}if(t.presetId===`custom`){let e=h(t.customTimes);if(e){M(I,e),V();return}}L.activeSpeakerId&&L.activeSpeakerId!==e||(K(),z=e,l(L,e),u(L,e,{phase:n.prep?`prep`:`running`,elapsedMs:null,finishedAt:null,inRange:null,qualified:null,status:null}),R=w(n,{onTick:t=>{u(L,e,{phase:t.phase}),F(I,e,b(t.mainElapsedMs),{prepRemaining:t.prepRemainingMs,inGrace:t.inGrace})},onFlagChange:(e,t)=>{B.active=!0,B.flag=e,B.inGrace=t,j(I,B)}}),B.active=!0,R.start(),V())}function J(e){z!==e||!R||(R.pause(),u(L,e,{phase:`paused`}),B.active=!1,j(I,B),V())}function Y(e){if(z!==e||!R)return;R.resume();let t=R.getState();u(L,e,{phase:t.phase}),B.active=!0,B.flag=t.flag,B.inGrace=t.inGrace,j(I,B),V()}function X(e){if(z!==e||!R)return;let t=L.speakers.find(t=>t.id===e),n=_(t);if(!n||!t)return;let r=R.stop(),i=x(n,r);u(L,e,{phase:`finished`,elapsedMs:r,finishedAt:new Date().toISOString(),inRange:i.inRange,qualified:i.qualified,status:i.status}),K(),l(L,null),V()}async function Z(){let{text:e}=T(L.speakers);try{await navigator.clipboard.writeText(e),N(I)}catch{let t=document.createElement(`textarea`);t.value=e,document.body.appendChild(t),t.select(),document.execCommand(`copy`),document.body.removeChild(t),N(I)}}V();