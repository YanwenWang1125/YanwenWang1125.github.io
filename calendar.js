// The daily log as a wall calendar: one month per page, flip with the arrows or a swipe.
(() => {
  const LOG = window.LOG;
  if (!LOG) return;

  const TAGS = {
    Research: "#f2c46d",
    Learning: "#8fe0cf",
    Web: "#c9d3e3",
    TA: "#ff9e7a",
    Courses: "#7cc4ff",
    Tutoring: "#f5a3c7",
    Diamond: "#a6d96a",
    Jobs: "#b8a1ff",
    Other: "#8f97ab",
  };
  // Words in an entry that point at a star on the map
  const LINKS = [
    [/FT_Rewrite|AUTOLOOP|Jeon|Liou|ancilla|fault-tolerant rewrite|M0|beam|MILP/, "rewrite"],
    [/PINQ/, "pinq"],
    [/VQE|LiH|BeH2|ADAPT/, "vqe"],
    [/QCNN|Hur /, "qcnn"],
    [/EQE-QAOA/, "eqeqaoa"],
    [/2605\.10910|Clifford/, "clifford"],
    [/QML_Circuit_Selection/, "qcs"],
    [/QAICON|Q-AICON|TeamWeb|lab website/, "aicon"],
    [/interactive (page|site|primer|quantum)|quantum-spheres/, "explainers"],
    [/video/, "animation"],
    [/NSERC|Mitacs/, "proposal"],
    [/DFC|flight-school/, "flight"],
    [/literature review|map of the ML for QEC/, "litreview"],
    [/Stim|surface code/, "stim"],
    [/QEC|syndrome|stabiliser/, "qec"],
    [/kernel|Shaydulin/, "kernels"],
    [/barren|QNN|parameter-shift/i, "qnn"],
    [/GPU|Fir/, "hpc"],
    [/group meeting/i, "talk"],
    [/CS9548|CS9833/, "courses"],
    [/Physics 11|Tutoring/, "tutor"],
    [/CS3357|[Mm]idterm|Quiz|autograder/, "ta"],
  ];
  // Turning points of the term, in order; each opens its day
  const BEATS = [
    ["2026-09-17", "Day one", "First quantum notes"],
    ["2026-09-25", "Chapter 3 done", "Quantum kernels"],
    ["2026-10-09", "0 of 75", "A generic ansatz never reaches chemical accuracy"],
    ["2026-10-14", "5.6× on a GPU", "VQE gradients on an H100"],
    ["2026-10-16", "Direction set", "ML for quantum"],
    ["2026-10-28", "Topic chosen", "Fault-tolerant rewrites"],
    ["2026-10-31", "12 ancillas", "Three fewer than the best published circuit"],
  ];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const HEAD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const root = document.getElementById("log");
  const page = document.getElementById("logCal");
  const view = document.getElementById("logDay");
  const tagBar = document.getElementById("logTags");
  const toggle = document.getElementById("logToggle");
  const BEHIND = ["sky", "panel", "index", "connect"].map((id) => document.getElementById(id))
    .concat([document.querySelector(".top"), document.querySelector(".bottom")]);

  const dateOf = (key) => new Date(key + "T12:00:00");
  const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const nice = (key) => { const d = dateOf(key); return `${WEEKDAY[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
  const first = dateOf(LOG.first), last = dateOf(LOG.last);
  const months = [];
  for (let m = new Date(first.getFullYear(), first.getMonth(), 1); m <= last; m.setMonth(m.getMonth() + 1)) months.push(new Date(m));
  const max = Math.max(...Object.values(LOG.days).map((d) => d.items.length));
  const stars = new Map((window.SKY ? window.SKY.stars : []).map((s) => [s.id, s]));
  const plain = (html) => html.replace(/<[^>]+>/g, "");

  let monthIndex = months.findIndex((m) => m.getMonth() === 9); // October: the fullest month
  if (monthIndex < 0) monthIndex = months.length - 1;
  let selected = null; // a date string, or null for the overview
  let tagFilter = null;
  let lastFocus = null;
  let turning = false;

  const count = (day) => (day && !day.empty ? day.items.filter((i) => !tagFilter || i.tag === tagFilter).length : 0);
  const tagsOf = (day) => (day && !day.empty ? [...new Set(day.items.map((i) => i.tag))] : []);

  // ── One calendar page ───────────────────────────────────────
  function pageHTML() {
    const m = months[monthIndex];
    const start = new Date(m); start.setDate(1 - ((m.getDay() + 6) % 7));
    const end = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    end.setDate(end.getDate() + (7 - ((end.getDay() + 6) % 7) - 1));
    const logged = Object.keys(LOG.days).filter((k) => dateOf(k).getMonth() === m.getMonth() && !LOG.days[k].empty).length;
    let cells = "";
    const today = keyOf(new Date());
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = keyOf(d), entry = LOG.days[k];
      const other = d.getMonth() !== m.getMonth();
      const inRange = d >= first && d <= last;
      const now = k === today ? ` today" aria-current="date` : "";
      if (!inRange) { cells += `<span class="cal-cell out${other ? " other" : ""}${now}"${now ? ` aria-label="Today, not written yet"` : ""}><span class="num">${d.getDate()}</span></span>`; continue; }
      const n = count(entry);
      const size = n ? 5 + Math.round((n / max) * 14) : 3;
      const dots = tagsOf(entry).map((t) => `<i style="--c:${TAGS[t] || "#8f97ab"}" class="${tagFilter && t !== tagFilter ? "off" : ""}"></i>`).join("");
      cells += `<button class="cal-cell${n ? "" : " quiet"}${other ? " other" : ""}${k === selected ? " on" : ""}${now}" data-day="${k}" aria-pressed="${k === selected}"
        aria-label="${nice(k)}, ${n ? `${n} ${n === 1 ? "entry" : "entries"}` : "no entries"}">
        <span class="num">${d.getDate()}</span>
        <span class="star" style="--s:${size}px"></span>
        <span class="dots">${dots}</span>
      </button>`;
    }
    return `
      <div class="sheet-rings" aria-hidden="true"><i></i><i></i></div>
      <div class="sheet-head">
        <button class="round" data-flip="-1" ${monthIndex > 0 ? "" : "disabled"} aria-label="Previous month">‹</button>
        <h3 aria-live="polite"><span data-month="${m.getMonth()}">${MONTHS[m.getMonth()]}</span> <span>${m.getFullYear()}</span></h3>
        <button class="round" data-flip="1" ${monthIndex < months.length - 1 ? "" : "disabled"} aria-label="Next month">›</button>
      </div>
      <p class="sheet-sub">${logged} logged ${logged === 1 ? "day" : "days"} this month</p>
      <div class="cal-grid">
        ${HEAD.map((h) => `<span class="cal-dow">${h}</span>`).join("")}
        ${cells}
      </div>`;
  }

  function drawPage() {
    page.innerHTML = pageHTML();
    page.querySelectorAll("[data-month]").forEach((el) => window.letter && window.letter(el, `m${el.dataset.month}`));
    page.querySelectorAll("[data-day]").forEach((b) => b.addEventListener("click", () => show(b.dataset.day)));
    page.querySelectorAll("[data-flip]").forEach((b) => b.addEventListener("click", () => flip(+b.dataset.flip)));
  }

  // Turn the page: the old one folds away, the new one swings in
  function flip(step, then) {
    const next = monthIndex + step;
    if (next < 0 || next >= months.length || turning) return;
    if (reduce) { monthIndex = next; drawPage(); if (then) then(); return; }
    turning = true;
    page.classList.add(step > 0 ? "turn-out-next" : "turn-out-prev");
    setTimeout(() => {
      monthIndex = next;
      drawPage();
      page.classList.remove("turn-out-next", "turn-out-prev");
      page.classList.add(step > 0 ? "turn-in-next" : "turn-in-prev");
      setTimeout(() => { page.classList.remove("turn-in-next", "turn-in-prev"); turning = false; if (then) then(); }, 260);
    }, 220);
  }

  // Swipe to flip on touch screens
  let swipe = null;
  page.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") swipe = { x: e.clientX, y: e.clientY }; });
  page.addEventListener("pointerup", (e) => {
    if (!swipe) return;
    const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) flip(dx < 0 ? 1 : -1);
  });

  // Arrow keys move a day or a week, and flip the page at a month's edge; Page Up/Down flip months
  page.addEventListener("keydown", (e) => {
    if (e.key === "PageDown" || e.key === "PageUp") { e.preventDefault(); flip(e.key === "PageDown" ? 1 : -1); return; }
    const b = e.target.closest("[data-day]");
    if (!b) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    const d = dateOf(b.dataset.day); d.setDate(d.getDate() + step);
    const k = keyOf(d);
    const focusDay = () => { const n = page.querySelector(`[data-day="${k}"]`); if (n) n.focus(); };
    if (page.querySelector(`[data-day="${k}"]`)) focusDay();
    else if (LOG.days[k]) flip(d.getMonth() > months[monthIndex].getMonth() ? 1 : -1, focusDay);
  });

  // ── Tag filter ──────────────────────────────────────────────
  function buildTags() {
    const totals = {};
    Object.values(LOG.days).forEach((d) => d.items.forEach((i) => { totals[i.tag] = (totals[i.tag] || 0) + 1; }));
    const order = Object.keys(TAGS).filter((t) => totals[t]);
    tagBar.innerHTML = `<button class="tag${tagFilter ? "" : " on"}" data-tag="" aria-pressed="${!tagFilter}">All</button>` +
      order.map((t) => `<button class="tag${tagFilter === t ? " on" : ""}" data-tag="${t}" style="--c:${TAGS[t]}" aria-pressed="${tagFilter === t}"><i></i>${t}<span>${totals[t]}</span></button>`).join("");
    tagBar.querySelectorAll("[data-tag]").forEach((b) => b.addEventListener("click", () => {
      tagFilter = b.dataset.tag || null;
      buildTags(); drawPage(); render();
    }));
  }

  // ── Right-hand side: one day, or the overview ──────────────
  function show(key) {
    const target = dateOf(key);
    const mi = months.findIndex((m) => m.getMonth() === target.getMonth());
    selected = key;
    history.replaceState(null, "", `#log/${key}`);
    if (mi !== monthIndex) flip(mi - monthIndex, () => {});
    else drawPage();
    render();
    const b = page.querySelector(`[data-day="${key}"]`);
    if (b && document.activeElement && document.activeElement.closest("#logCal")) b.focus();
    if (matchMedia("(max-width: 900px)").matches) view.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  let render = function () {
    if (!selected) return renderOverview();
    const day = LOG.days[selected];
    const wk = LOG.weeks[day.week];
    const keys = Object.keys(LOG.days);
    const i = keys.indexOf(selected);
    const items = day.empty ? [] : day.items.filter((x) => !tagFilter || x.tag === tagFilter);
    const linked = [...new Set(items.flatMap((x) => LINKS.filter(([re]) => re.test(plain(x.text + (x.sub || []).join(" ")))).map(([, id]) => id)))]
      .filter((id) => stars.has(id)).slice(0, 6);
    view.innerHTML = `
      <div class="day-nav">
        <button class="ghost" data-go="overview">Overview</button>
        <span>
          <button class="round" data-go="${keys[i - 1] || ""}" ${i > 0 ? "" : "disabled"} aria-label="Previous day">‹</button>
          <button class="round" data-go="${keys[i + 1] || ""}" ${i < keys.length - 1 ? "" : "disabled"} aria-label="Next day">›</button>
        </span>
      </div>
      <p class="day-week">${wk.label}${wk.theme ? ` · ${esc(wk.theme)}` : ""}</p>
      <h3>${nice(selected)}${day.label ? ` <small>${esc(day.label)}</small>` : ""}</h3>
      ${day.empty ? `<p class="empty">Nothing was written down this day.</p>` : items.length ? `<ul class="entries">${items.map((x) => `
        <li style="--c:${TAGS[x.tag] || "#8f97ab"}">
          <span class="pill"><i></i>${esc(x.tag)}</span>
          <div><p>${x.text}</p>${x.sub ? `<ul>${x.sub.map((s) => `<li>${s}</li>`).join("")}</ul>` : ""}</div>
        </li>`).join("")}</ul>` : `<p class="empty">No ${esc(tagFilter)} entries this day.</p>`}
      ${day.note ? `<p class="note">${day.note}</p>` : ""}
      ${linked.length ? `<div class="day-stars"><p>On the star map</p>${linked.map((id) => { const s = stars.get(id); return `<button data-star="${id}" style="--c:${s.colour}"><i></i>${esc(s.title)}</button>`; }).join("")}</div>` : ""}
    `;
    wire();
  }

  function renderOverview() {
    const all = Object.values(LOG.days);
    const active = all.filter((d) => !d.empty).length;
    const entries = all.reduce((a, d) => a + d.items.length, 0);
    view.innerHTML = `
      <h3>Seven weeks at a glance</h3>
      <dl class="stats">
        <div><dt>Days logged</dt><dd>${active}<span> / ${all.length}</span></dd></div>
        <div><dt>Entries</dt><dd>${entries}</dd></div>
        <div><dt>Weeks</dt><dd>${LOG.weeks.length}</dd></div>
      </dl>
      ${LOG.summary.map((s) => `
        <section class="sum">
          <h4>${esc(s.title)}</h4>
          <ul>${s.items.map((x) => `<li>${x.text}${x.sub ? `<ul>${x.sub.map((t) => `<li>${t}</li>`).join("")}</ul>` : ""}</li>`).join("")}</ul>
        </section>`).join("")}
      <button class="ghost wide" data-go="${LOG.last}">Start from the latest day</button>
    `;
    wire();
  }

  function wire() {
    view.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
      const g = b.dataset.go;
      if (g === "overview") { selected = null; drawPage(); render(); history.replaceState(null, "", "#log"); }
      else if (g) show(g);
    }));
    view.querySelectorAll("[data-star]").forEach((b) => b.addEventListener("click", () => {
      close();
      if (window.openStar) window.openStar(b.dataset.star);
    }));
  }

  // ── Open and close ──────────────────────────────────────────
  function open() {
    if (!root.hidden) return;
    lastFocus = document.activeElement;
    locate(); drawPage(); render();
    root.hidden = false;
    document.body.classList.add("log-open");
    toggle.setAttribute("aria-expanded", "true");
    BEHIND.forEach((el) => el && (el.inert = true));
    history.replaceState(null, "", `#log/${selected}`);
    // land on this week of the calendar rather than the top of the page
    const spot = page.querySelector(".cal-cell.today") || page.querySelector(".cal-cell.on");
    if (spot) spot.scrollIntoView({ block: "center" });
    requestAnimationFrame(() => root.classList.add("in"));
    root.querySelector(".log-close").focus({ preventScroll: true });
  }
  function close() {
    if (root.hidden) return;
    root.classList.remove("in");
    root.hidden = true;
    document.body.classList.remove("log-open");
    toggle.setAttribute("aria-expanded", "false");
    BEHIND.forEach((el) => el && (el.inert = false));
    if (location.hash.startsWith("#log")) history.replaceState(null, "", location.pathname);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  toggle.addEventListener("click", () => (root.hidden ? open() : close()));
  root.querySelector(".log-close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !root.hidden) close(); });
  window.addEventListener("hashchange", () => (location.hash.startsWith("#log") ? open() : close()));

  function esc(t) { return String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  // the log opens on today, or on the latest day written so far if today isn't in it yet;
  // a link like #log/2026-10-30 opens that day instead
  function locate() {
    const linked = location.hash.match(/^#log\/(\d{4}-\d{2}-\d{2})$/);
    const today = keyOf(new Date());
    const written = Object.keys(LOG.days).filter((k) => k <= today && !LOG.days[k].empty).sort();
    selected = linked && LOG.days[linked[1]] ? linked[1] : LOG.days[today] ? today : written[written.length - 1] || LOG.last;
    monthIndex = months.findIndex((m) => m.getMonth() === dateOf(selected).getMonth());
  }
  locate();
  const beats = document.getElementById("logBeats");
  function drawBeats() {
    beats.innerHTML = BEATS.map(([k, title, text]) => {
      const d = dateOf(k);
      return `<li><button data-beat="${k}" aria-pressed="${k === selected}"><span class="beat-date">${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}</span><strong>${esc(title)}</strong><span class="beat-text">${esc(text)}</span></button></li>`;
    }).join("");
    beats.querySelectorAll("[data-beat]").forEach((b) => b.addEventListener("click", () => show(b.dataset.beat)));
  }
  const _render = render;
  render = function () { _render(); drawBeats(); };

  buildTags(); drawPage(); render();
  if (location.hash.startsWith("#log")) open();
})();
