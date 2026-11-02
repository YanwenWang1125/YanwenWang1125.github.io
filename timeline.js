// The timeline: the turning points of my studies, work, research and projects since 2019.
(() => {
  const KINDS = {
    Study: "#ff9e7a",
    Work: "#8fe0cf",
    Research: "#f2c46d",
    Project: "#9cc7ff",
    Teaching: "#f5a3c7",
  };
  // [start, end or "", kind, title, one sentence, star id]. Only the moments that changed the path.
  const EVENTS = [
    ["2019-09", "", "Study", "Started a BSc in Computer Science", "An Honours BSc at Western University, and the start of everything on this map.", "bsc"],
    ["2022-01", "2022-08", "Work", "Software Engineer Intern, Geotab", "My first software job: eight months in Toronto building a Django tool to manage Google Cloud storage.", "geotab"],
    ["2023-04", "2023-08", "Work", "Research Assistant, Ivey Business School", "My first taste of research: OCR and mathematical morphology for noisy scanned documents.", "ivey"],
    ["2024-01", "", "Project", "HoloLens 2 aneurysm visualisation", "A capstone with Robarts Research Institute: 3D holograms surgeons can share with patients.", "hololens"],
    ["2024-02", "", "Study", "Finished the BSc", "Honours Computer Science, GPA 3.9/4.0.", "bsc"],
    ["2024-02", "2024-09", "Work", "Software Engineer Intern, Geotab", "Back at Geotab: software development and DevOps with Docker and Kubernetes.", "geotab"],
    ["2024-09", "", "Study", "Started an MSc in Artificial Intelligence", "Advanced machine learning, neural networks and unstructured data at Western.", "msc"],
    ["2024-09", "2025-09", "Research", "Wildfire prediction across Canada", "A Vision Transformer on fire-danger maps fused with an LSTM on weather: AUC-ROC 0.91.", "wildfire"],
    ["2025-09", "", "Study", "Finished the MSc", "Artificial Intelligence, GPA 3.9/4.0.", "msc"],
    ["2025-09", "2026-09", "Work", "AI Solution Intern, SFU Health Care Center", "In a team of three, an LLM front desk for booking, intake, questions and call routing, with staff review.", "agent"],
    ["2025-10", "", "Project", "RealtorOS and RubriCheck", "Two AI products of my own: a CRM for realtors on Azure, and essay feedback that quotes its evidence.", "realtor"],
    ["2026-07", "", "Project", "Flight school cancellation recovery", "A scheduling system for Diamond Flight Centre London, and the NSERC Alliance–Mitacs proposal behind it.", "flight"],
    ["2026-09", "", "Study", "Started the PhD", "Computer Science at Western with Prof. Fang Fang, and my first quantum textbook.", "phd"],
    ["2026-09", "", "Teaching", "Teaching assistant, CS3357", "Midterms, quizzes and a class to look after.", "ta"],
    ["2026-10", "", "Research", "First quantum results", "VQE on three molecules and a QCNN checked against classical baselines.", "vqe"],
    ["2026-10", "", "Research", "Learning-guided fault-tolerant rewrites", "My PhD topic: a 12-ancilla circuit for the [[17,1,5]] colour code, level with the best published 15.", "rewrite"],
    ["2026-12", "2027-03", "Research", "Rewrites on real hardware", "Running original and rewritten circuits on the IBM Quantum System One at PINQ².", "pinq"],
  ];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const NOW = "2026-11";

  const root = document.getElementById("timeline");
  const body = document.getElementById("tlBody");
  const kindBar = document.getElementById("tlKinds");
  const toggles = document.querySelectorAll("[data-open='timeline']");
  const BEHIND = ["sky", "panel", "index", "connect"].map((id) => document.getElementById(id))
    .concat([document.querySelector(".top"), document.querySelector(".bottom")]);
  const stars = new Map((window.SKY ? window.SKY.stars : []).map((s) => [s.id, s]));
  let kind = null, lastFocus = null;

  const label = (ym) => { const [y, m] = ym.split("-"); return `${MONTHS[+m - 1]} ${y}`; };
  const span = (a, b) => (b ? `${label(a)} – ${label(b)}` : label(a));
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function buildKinds() {
    const totals = {};
    EVENTS.forEach((e) => { totals[e[2]] = (totals[e[2]] || 0) + 1; });
    kindBar.innerHTML = `<button class="tag${kind ? "" : " on"}" data-kind="" aria-pressed="${!kind}">All</button>` +
      Object.keys(KINDS).map((k) => `<button class="tag${kind === k ? " on" : ""}" data-kind="${k}" style="--c:${KINDS[k]}" aria-pressed="${kind === k}"><i></i>${k}<span>${totals[k] || 0}</span></button>`).join("");
    kindBar.querySelectorAll("[data-kind]").forEach((b) => b.addEventListener("click", () => { kind = b.dataset.kind || null; buildKinds(); render(); }));
  }

  function render() {
    const years = {};
    EVENTS.filter((e) => !kind || e[2] === kind).forEach((e) => { (years[e[0].slice(0, 4)] ||= []).push(e); });
    const ys = Object.keys(years).sort();
    if (!ys.length) { body.innerHTML = `<p class="empty">Nothing of this kind yet.</p>`; return; }
    body.innerHTML = ys.map((y) => `
      <section class="tl-year">
        <h3 class="tl-y" data-type="y${y}">${y}</h3>
        <ol class="tl-events">
          ${years[y].map(([a, b, k, title, text, star]) => {
            const future = a > NOW;
            const live = !future && b && b >= NOW;
            return `<li class="${future ? "future" : ""}" style="--c:${KINDS[k]}">
              <p class="tl-when">${span(a, b)}${future ? " · next" : live ? " · now" : ""}</p>
              <h4>${esc(title)}</h4>
              <p class="tl-text">${esc(text)}</p>
              <p class="tl-meta"><span class="pill"><i></i>${k}</span>${stars.has(star) ? `<button class="tl-star" data-star="${star}">See it on the map</button>` : ""}</p>
            </li>`;
          }).join("")}
        </ol>
      </section>`).join("");
    body.querySelectorAll("[data-type]").forEach((el) => window.letter && window.letter(el, el.dataset.type));
    body.querySelectorAll("[data-star]").forEach((b) => b.addEventListener("click", () => {
      close();
      if (window.openStar) window.openStar(b.dataset.star);
    }));
  }

  function open() {
    if (!root.hidden) return;
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("log-open");
    toggles.forEach((t) => t.setAttribute("aria-expanded", "true"));
    BEHIND.forEach((el) => el && (el.inert = true));
    if (location.hash !== "#timeline") history.replaceState(null, "", "#timeline");
    requestAnimationFrame(() => root.classList.add("in"));
    root.querySelector(".log-close").focus({ preventScroll: true });
  }
  function close() {
    if (root.hidden) return;
    root.classList.remove("in");
    root.hidden = true;
    document.body.classList.remove("log-open");
    toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
    BEHIND.forEach((el) => el && (el.inert = false));
    if (location.hash === "#timeline") history.replaceState(null, "", location.pathname);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  toggles.forEach((t) => t.addEventListener("click", () => (root.hidden ? open() : close())));
  root.querySelector(".log-close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !root.hidden) close(); });
  window.addEventListener("hashchange", () => (location.hash === "#timeline" ? open() : close()));

  buildKinds(); render();
  if (location.hash === "#timeline") open();
})();
