// The star map: me in the centre, four orbits of research, projects, knowledge and story.
(() => {
  const { me, groups, stars } = window.SKY;
  const byId = new Map(stars.map((s) => [s.id, s]));
  byId.set("me", me);

  const CREDITS = {
    "assets/northwest-crown-fire-experiment.png":
      'Photo: <a href="https://commons.wikimedia.org/wiki/File:Northwest_Crown_Fire_Experiment.png">Northwest Crown Fire Experiment</a>, USDA Forest Service, <a href="https://creativecommons.org/licenses/by/2.5">CC BY 2.5</a>, via Wikimedia Commons.',
    "assets/hfa-cessna-172-training-aircraft.jpg":
      'Photo: <a href="https://commons.wikimedia.org/wiki/File:HFA_Cessna_172_Training_Aircraft.jpg">HFA Cessna 172 Training Aircraft</a> by Steve42467, <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>, via Wikimedia Commons.',
    "assets/nist-sd-19-f1002-33.png":
      'Image: <a href="https://commons.wikimedia.org/wiki/File:NIST_SD-19_f1002_33.png">NIST Special Database 19</a>, public domain, via Wikimedia Commons.',
  };

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const tip = document.getElementById("tip");
  const panel = document.getElementById("panel");
  const panelBody = document.getElementById("panelBody");

  let W = 0, H = 0, DPR = 1;
  let bg = null; // pre-rendered milky way
  let flares = []; // twinkling foreground stars

  // View state
  const view = { yaw: 0.4, tilt: 1.05, zoom: 1, vyaw: 0 };
  const target = { zoom: 1, shift: 0, shiftY: 0 };
  let shift = 0, shiftY = 0; // centre slides aside when the panel is open
  const shown = Object.fromEntries(Object.keys(groups).map((g) => [g, true]));
  const fade = Object.fromEntries(Object.keys(groups).map((g) => [g, 1]));
  let hover = null, selected = null, selectT = 0;
  let keyIndex = -1;

  // ── Place each star on its orbit ────────────────────────────
  const rand = mulberry(20261102);
  Object.entries(groups).forEach(([g, info]) => {
    const list = stars.filter((s) => s.group === g);
    const offset = rand() * Math.PI * 2;
    list.forEach((s, i) => {
      s.orbit = info.orbit;
      s.colour = info.colour;
      s.angle = offset + (i / list.length) * Math.PI * 2 + (rand() - 0.5) * 0.35;
      s.rj = 1 + (rand() - 0.5) * 0.08;
      s.z = (rand() - 0.5) * 0.06;
      s.phase = rand() * Math.PI * 2;
    });
  });
  const ORBIT_R = [0, 0.22, 0.37, 0.52, 0.67, 0.83, 1];
  const ORBIT_SPEED = [0, 0.012, 0.009, 0.007, 0.0055, 0.0045, 0.0035];

  function radius() { return W < 760 ? Math.min(W * 0.6, H * 0.5) : Math.min(W * 0.46, H * 0.78); }

  function project(s, t) {
    const R = radius() * view.zoom;
    const a = s.angle + view.yaw + orbitT * ORBIT_SPEED[s.orbit];
    const r = ORBIT_R[s.orbit] * s.rj * R;
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    const z = s.z * R;
    const ct = Math.cos(view.tilt), st = Math.sin(view.tilt);
    const depth = y * st + z * ct; // + toward the viewer
    const scale = 1 + depth / (R * 3.2);
    return {
      x: centreX() + x,
      y: centreY() + y * ct - z * st,
      depth,
      scale,
    };
  }
  const centreX = () => W / 2 + shift;
  const centreY = () => H * (W < 760 ? 0.6 : 0.54) + shiftY;

  // ── Background: a milky way drawn once ──────────────────────
  function buildBackground() {
    const w = Math.ceil(W * 1.4), h = Math.ceil(H * 1.4);
    const c = document.createElement("canvas");
    c.width = w * DPR; c.height = h * DPR;
    const g = c.getContext("2d");
    g.scale(DPR, DPR);
    g.fillStyle = "#04060c";
    g.fillRect(0, 0, w, h);
    const r = mulberry(7);
    // band runs from lower left to upper right
    const ang = -0.52, cx = w * 0.5, cy = h * 0.5;
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const band = (u, v, size, colour, alpha) => {
      const px = cx + ux * u - uy * v, py = cy + uy * u + ux * v;
      const grd = g.createRadialGradient(px, py, 0, px, py, size);
      grd.addColorStop(0, colour.replace("A", alpha));
      grd.addColorStop(1, colour.replace("A", 0));
      g.fillStyle = grd;
      g.fillRect(px - size, py - size, size * 2, size * 2);
    };
    const L = Math.hypot(w, h) * 0.6;
    for (let i = 0; i < 90; i++) {
      const u = (r() - 0.5) * 2 * L, v = gauss(r) * h * 0.07;
      band(u, v, 80 + r() * 220, i % 3 ? "rgba(70,90,140,A)" : "rgba(150,110,80,A)", 0.05 + r() * 0.05);
    }
    // dust lanes
    for (let i = 0; i < 40; i++) {
      const u = (r() - 0.5) * 2 * L, v = gauss(r) * h * 0.025;
      band(u, v, 40 + r() * 120, "rgba(4,6,12,A)", 0.35);
    }
    // stars: dense in the band, sparse elsewhere
    const n = Math.round((w * h) / 260);
    for (let i = 0; i < n; i++) {
      let x, y;
      if (r() < 0.6) {
        const u = (r() - 0.5) * 2 * L, v = gauss(r) * h * 0.09;
        x = cx + ux * u - uy * v; y = cy + uy * u + ux * v;
      } else { x = r() * w; y = r() * h; }
      const m = r();
      const size = m < 0.97 ? 0.35 + r() * 0.5 : 0.9 + r() * 0.9;
      const tint = r();
      g.fillStyle = tint < 0.15 ? "rgba(255,210,170,A)" : tint < 0.35 ? "rgba(180,205,255,A)" : "rgba(235,238,255,A)";
      g.fillStyle = g.fillStyle.replace ? g.fillStyle : g.fillStyle;
      g.globalAlpha = 0.25 + r() * 0.65;
      g.beginPath(); g.arc(x, y, size, 0, Math.PI * 2);
      g.fillStyle = tint < 0.15 ? "#ffd2aa" : tint < 0.35 ? "#b4cdff" : "#ebeeff";
      g.fill();
    }
    g.globalAlpha = 1;
    bg = { canvas: c, w, h };

    const rf = mulberry(99);
    flares = Array.from({ length: Math.round((W * H) / 9000) }, () => ({
      x: rf() * 1.4, y: rf() * 1.4, s: 0.6 + rf() * 1.2, p: rf() * Math.PI * 2, f: 0.6 + rf() * 1.6,
    }));
  }

  // ── Resize ─────────────────────────────────────────────────
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    if (!W || !H) return;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildBackground();
  }

  // ── Drawing ────────────────────────────────────────────────
  let shooting = null, nextShoot = 4;
  let orbitT = 0, lastTime = 0, yawTo = null;

  function draw(t) {
    const time = t / 1000;
    if (!W || !H) { resize(); requestAnimationFrame(draw); return; }
    // the orbits stand still while a star is open or under the pointer
    const dt = Math.min(0.1, time - lastTime); lastTime = time;
    if (!reduce && !selected && !hover) orbitT += dt;
    // ease view
    view.zoom += (target.zoom - view.zoom) * 0.12;
    shift += (target.shift - shift) * 0.1;
    shiftY += (target.shiftY - shiftY) * 0.1;
    if (yawTo !== null && !dragging) {
      view.yaw += (yawTo - view.yaw) * 0.08;
      if (Math.abs(yawTo - view.yaw) < 0.002) yawTo = null;
    } else if (!dragging) { view.yaw += view.vyaw; view.vyaw *= 0.94; }
    Object.keys(fade).forEach((g) => { fade[g] += ((shown[g] ? 1 : 0) - fade[g]) * 0.15; });
    selectT = Math.min(1, selectT + 0.03);

    // background with parallax
    const px = -(view.yaw % (Math.PI * 2)) * 18 - W * 0.2 + shift * 0.2;
    const py = -(view.tilt - 1.05) * 60 - H * 0.2;
    ctx.drawImage(bg.canvas, 0, 0, bg.canvas.width, bg.canvas.height, px % 1 === 0 ? px : px, py, bg.w, bg.h);

    // twinkling stars
    for (const f of flares) {
      const a = reduce ? 0.6 : 0.35 + 0.35 * Math.sin(time * f.f + f.p);
      ctx.globalAlpha = a;
      ctx.fillStyle = "#f4f6ff";
      ctx.beginPath();
      ctx.arc(f.x * W * 0.72 + px * 0.5 + W * 0.15, f.y * H * 0.72 + py * 0.3 + H * 0.15, f.s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    drawShooting(time);

    // orbits
    const R = radius() * view.zoom;
    const ct = Math.cos(view.tilt);
    Object.values(groups).forEach((info) => {
      const g = Object.keys(groups).find((k) => groups[k] === info);
      ctx.strokeStyle = hexA(info.colour, 0.16 * fade[g] + 0.04);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centreX(), centreY(), ORBIT_R[info.orbit] * R, ORBIT_R[info.orbit] * R * ct, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // project stars
    const pts = stars.map((s) => ({ s, ...project(s, time) }));
    pts.sort((a, b) => a.depth - b.depth);
    current = pts;

    // constellation lines for the selected star
    if (selected && selected !== me) {
      const from = pts.find((p) => p.s === selected);
      const rel = (selected.related || []).map((id) => pts.find((p) => p.s.id === id)).filter(Boolean);
      ctx.lineWidth = 1.2;
      for (const to of rel) {
        ctx.strokeStyle = hexA(selected.colour, 0.75);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(from.x + (to.x - from.x) * ease(selectT), from.y + (to.y - from.y) * ease(selectT));
        ctx.stroke();
      }
      ctx.setLineDash([2, 6]);
      ctx.strokeStyle = hexA("#ffffff", 0.25);
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(centreX(), centreY()); ctx.stroke();
      ctx.setLineDash([]);
    }

    const related = new Set(selected && selected.related ? selected.related : []);
    placed = []; queued = [];
    for (const p of pts) if (p.depth < 0) drawStar(p, time, related);
    drawSun(time);
    for (const p of pts) if (p.depth >= 0) drawStar(p, time, related);
    // labels: the open star and its neighbours claim their space first
    queued.sort((a, b) => a.rank - b.rank).forEach((q) => label(q.text, q.x, q.y, q.colour, q.alpha, false));

    requestAnimationFrame(draw);
  }
  let current = [], placed = [], queued = [];

  function drawSun(time) {
    const x = centreX(), y = centreY();
    const pulse = reduce ? 1 : 1 + 0.04 * Math.sin(time * 1.3);
    const base = Math.max(10, radius() * 0.04) * view.zoom * pulse;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, base * 7);
    glow.addColorStop(0, "rgba(255,236,190,0.55)");
    glow.addColorStop(0.25, "rgba(242,196,109,0.18)");
    glow.addColorStop(1, "rgba(242,196,109,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, base * 7, 0, Math.PI * 2); ctx.fill();
    // spikes
    ctx.strokeStyle = "rgba(255,240,210,0.5)";
    ctx.lineWidth = 1;
    const sp = base * 4.2;
    ctx.beginPath();
    ctx.moveTo(x - sp, y); ctx.lineTo(x + sp, y);
    ctx.moveTo(x, y - sp); ctx.lineTo(x, y + sp);
    ctx.stroke();
    ctx.fillStyle = "#fff8ea";
    ctx.beginPath(); ctx.arc(x, y, base, 0, Math.PI * 2); ctx.fill();
    if (hover === me || selected === me) {
      ctx.strokeStyle = "rgba(242,196,109,0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, base * 2.2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawStar(p, time, related) {
    const s = p.s;
    const a = fade[s.group];
    if (a < 0.02) return;
    const isSel = s === selected, isHov = s === hover, isRel = related.has(s.id);
    const dim = selected && !isSel && !isRel ? 0.4 : 1;
    const tw = reduce ? 1 : 0.85 + 0.15 * Math.sin(time * 2 + s.phase);
    const core = (1.3 + s.size * 1.15) * p.scale * Math.sqrt(view.zoom);
    const alpha = a * dim * Math.max(0.35, Math.min(1, 0.75 + p.depth / (radius() * view.zoom * 2)));

    ctx.globalAlpha = alpha;
    const gr = core * (isHov || isSel ? 9 : 6) * tw;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
    glow.addColorStop(0, hexA(s.colour, 0.55));
    glow.addColorStop(1, hexA(s.colour, 0));
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(p.x, p.y, gr, 0, Math.PI * 2); ctx.fill();
    if (s.size === 3) {
      ctx.strokeStyle = hexA(s.colour, 0.45);
      ctx.lineWidth = 1;
      const sp = core * 4.5 * tw;
      ctx.beginPath();
      ctx.moveTo(p.x - sp, p.y); ctx.lineTo(p.x + sp, p.y);
      ctx.moveTo(p.x, p.y - sp); ctx.lineTo(p.x, p.y + sp);
      ctx.stroke();
    }
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(p.x, p.y, core, 0, Math.PI * 2); ctx.fill();
    if (isSel || isHov) {
      ctx.strokeStyle = hexA(s.colour, 0.95);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, core + 9, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const showLabel = isSel || isRel || isHov || s.size === 3 || view.zoom > 1.45;
    if (showLabel && !isHov) queued.push({
      text: short(s.title), x: p.x, y: p.y + core + 18, alpha,
      colour: isSel || isRel ? "#ffffff" : hexA("#dfe4f0", 0.85),
      rank: (isSel ? 0 : isRel ? 1 : 2) * 10 - s.size,
    });
  }

  function label(text, x, y, colour, alpha, big) {
    ctx.font = big ? `400 ${W < 760 ? 20 : 24}px Boska, Georgia, serif` : `500 13px Geist, system-ui, sans-serif`;
    const w = ctx.measureText(text).width;
    const box = { l: x - w / 2 - 4, r: x + w / 2 + 4, t: y - 9, b: y + 9 };
    if (placed.some((q) => box.l < q.r && box.r > q.l && box.t < q.b && box.b > q.t)) return;
    placed.push(box);
    ctx.globalAlpha = alpha;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(4,6,12,0.95)";
    ctx.shadowBlur = 6;
    ctx.fillStyle = colour;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  function drawShooting(time) {
    if (reduce) return;
    if (!shooting && time > nextShoot) {
      shooting = { x: Math.random() * W * 0.8 + W * 0.1, y: Math.random() * H * 0.4, t0: time, a: 0.5 + Math.random() * 0.4 };
      nextShoot = time + 7 + Math.random() * 8;
    }
    if (!shooting) return;
    const k = (time - shooting.t0) / 0.9;
    if (k > 1) { shooting = null; return; }
    const len = 140, d = k * 420;
    const x = shooting.x + Math.cos(shooting.a) * d, y = shooting.y + Math.sin(shooting.a) * d;
    const g = ctx.createLinearGradient(x, y, x - Math.cos(shooting.a) * len, y - Math.sin(shooting.a) * len);
    g.addColorStop(0, `rgba(255,255,255,${0.8 * (1 - k)})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(shooting.a) * len, y - Math.sin(shooting.a) * len); ctx.stroke();
  }

  // ── Picking ────────────────────────────────────────────────
  function pick(mx, my) {
    let best = null, bd = W < 760 ? 26 : 20;
    for (const p of current) {
      if (fade[p.s.group] < 0.5) continue;
      const d = Math.hypot(p.x - mx, p.y - my);
      if (d < bd) { bd = d; best = p.s; }
    }
    const sunR = Math.max(24, radius() * 0.08 * view.zoom);
    if (!best && Math.hypot(centreX() - mx, centreY() - my) < sunR) best = me;
    return best;
  }

  function showTip(s, x, y) {
    if (!s) { tip.hidden = true; return; }
    tip.hidden = false;
    tip.innerHTML = `${esc(s.title)}<small>${esc(s.kind)} · ${esc(s.when)}</small>`;
    tip.style.left = `${Math.min(Math.max(x, 140), W - 140)}px`;
    tip.style.top = `${Math.max(y, 70)}px`;
  }

  // ── Pointer: drag to turn, wheel or pinch to zoom, click to open ──
  let dragging = false, moved = 0, last = null;
  const pointers = new Map();
  let pinch0 = 0, zoom0 = 1;

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = target.zoom;
    }
    dragging = true; moved = 0; last = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      target.zoom = clamp(zoom0 * Math.hypot(a.x - b.x, a.y - b.y) / pinch0, 0.6, 2.4);
      return;
    }
    if (dragging && last) {
      yawTo = null;
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      view.vyaw = dx * 0.005;
      view.yaw += dx * 0.005;
      view.tilt = clamp(view.tilt - dy * 0.004, 0.35, 1.4);
      last = { x: e.clientX, y: e.clientY };
      canvas.classList.toggle("dragging", moved > 4);
      tip.hidden = true;
      return;
    }
    const s = pick(e.clientX, e.clientY);
    hover = s;
    canvas.classList.toggle("pointing", !!s);
    showTip(s, e.clientX, e.clientY);
  });
  const end = (e) => {
    pointers.delete(e.pointerId);
    if (dragging && moved < 6) {
      const s = pick(e.clientX, e.clientY);
      if (s) open(s); else if (selected) closePanel();
    }
    dragging = false; last = null;
    canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerleave", () => { hover = null; tip.hidden = true; });
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    target.zoom = clamp(target.zoom * Math.exp(-e.deltaY * 0.0012), 0.6, 2.4);
  }, { passive: false });

  // Keyboard: arrows move between stars, Enter opens, Esc closes
  const order = () => [me, ...stars.filter((s) => shown[s.group])];
  canvas.addEventListener("keydown", (e) => {
    const list = order();
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      keyIndex = (keyIndex + (e.key === "ArrowRight" ? 1 : -1) + list.length) % list.length;
      hover = list[keyIndex];
      const p = hover === me ? { x: centreX(), y: centreY() } : current.find((q) => q.s === hover);
      if (p) showTip(hover, p.x, p.y);
    } else if (e.key === "Enter" && hover) {
      open(hover);
    } else if (e.key === "+" || e.key === "=") target.zoom = clamp(target.zoom * 1.15, 0.6, 2.4);
    else if (e.key === "-") target.zoom = clamp(target.zoom / 1.15, 0.6, 2.4);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closePanel(); toggleIndex(false); }
  });

  // ── Panel ──────────────────────────────────────────────────
  function open(s) {
    selected = s; selectT = 0;
    tip.hidden = true;
    if (s !== me) {
      // turn the system so the open star comes to the front, left of centre
      const now = s.angle + view.yaw + orbitT * ORBIT_SPEED[s.orbit];
      let d = (Math.PI * 0.62 - now) % (Math.PI * 2);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      yawTo = view.yaw + d;
      view.vyaw = 0;
    }
    const colour = s === me ? "#f2c46d" : s.colour;
    const group = s === me ? "The centre" : groups[s.group].name;
    const plot = s.image && s.image.includes("/fig/");
    panelBody.innerHTML = `
      <p class="meta" style="--c:${colour}"><span class="dot"></span>${esc(group)} · ${esc(s.kind)} · ${esc(s.when)}</p>
      <h2>${esc(s.title)}</h2>
      ${s.image ? `<figure class="${plot ? "plot" : ""}"><img src="${s.image}" alt="${esc(s.imageAlt || "")}" style="${s.imagePos ? `object-position:${s.imagePos}` : ""}"></figure>` : ""}
      <div>${s.body.map((t) => `<p>${esc(t)}</p>`).join("")}</div>
      ${s.facts ? `<dl>${s.facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>` : ""}
      ${s.links ? `<div class="links">${s.links.map(([k, v]) => `<a href="${v}" ${v.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(k)}</a>`).join("")}</div>` : ""}
      ${relatedHTML(s)}
      ${s.image && CREDITS[s.image] ? `<p class="credit">${CREDITS[s.image]}</p>` : ""}
    `;
    panelBody.querySelectorAll("[data-star]").forEach((b) =>
      b.addEventListener("click", () => open(byId.get(b.dataset.star))));
    panel.classList.remove("open");
    void panel.offsetWidth; // restart the entrance
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    target.shift = W >= 760 ? -Math.min(230, W * 0.16) : 0;
    target.shiftY = W >= 760 ? 0 : -H * 0.4;
    toggleIndex(false);
  }

  function relatedHTML(s) {
    const list = s === me
      ? stars.filter((x) => x.size === 3)
      : (s.related || []).map((id) => byId.get(id)).filter(Boolean);
    if (!list.length) return "";
    return `<div class="related"><h3>${s === me ? "Brightest stars" : "Connected stars"}</h3><ul>${list
      .map((x) => `<li><button data-star="${x.id}" style="--c:${x.colour}"><span class="dot"></span>${esc(short(x.title))}</button></li>`)
      .join("")}</ul></div>`;
  }

  function closePanel() {
    if (!selected) return;
    selected = null;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    target.shift = 0;
    target.shiftY = 0;
    canvas.focus({ preventScroll: true });
  }
  document.getElementById("close").addEventListener("click", closePanel);

  // ── Filters ────────────────────────────────────────────────
  const filters = document.querySelector(".filters");
  Object.entries(groups).forEach(([g, info]) => {
    const b = document.createElement("button");
    b.className = "filter";
    b.style.setProperty("--c", info.colour);
    b.setAttribute("aria-pressed", "true");
    b.innerHTML = `<span class="dot"></span>${info.name}`;
    b.addEventListener("click", () => {
      shown[g] = !shown[g];
      b.setAttribute("aria-pressed", String(shown[g]));
      if (selected && selected.group === g && !shown[g]) closePanel();
    });
    filters.appendChild(b);
  });

  // ── Index of every star ────────────────────────────────────
  const index = document.getElementById("index");
  const indexToggle = document.getElementById("indexToggle");
  indexToggle.textContent = `All ${stars.length + 1} stars`;
  index.innerHTML = `<h2>The centre</h2><ul><li><button data-star="me">Yanwen Wang</button></li></ul>` +
    Object.entries(groups).map(([g, info]) =>
      `<h2>${info.name}</h2><ul>${stars.filter((s) => s.group === g)
        .map((s) => `<li><button data-star="${s.id}">${esc(s.title)}</button></li>`).join("")}</ul>`).join("");
  index.querySelectorAll("[data-star]").forEach((b) =>
    b.addEventListener("click", () => open(byId.get(b.dataset.star))));
  function toggleIndex(force) {
    const on = force ?? index.hidden;
    index.hidden = !on;
    indexToggle.setAttribute("aria-expanded", String(on));
  }
  indexToggle.addEventListener("click", () => toggleIndex());

  // ── Clock: local time in London, Ontario ───────────────────
  const clock = document.getElementById("clock");
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hour: "2-digit", minute: "2-digit", hour12: false });
  const tick = () => { clock.textContent = `${fmt.format(new Date())} local time`; };
  tick(); setInterval(tick, 15000);

  // ── Helpers ────────────────────────────────────────────────
  function mulberry(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { return (r() + r() + r() + r() - 2) / 1.15; }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(k) { return 1 - Math.pow(1 - k, 3); }
  function short(t) { return t.length > 30 ? t.slice(0, 28).replace(/[\s,]+\S*$/, "") + "…" : t; }
  function esc(t) { return String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  window.addEventListener("resize", resize);
  resize();
  if (document.fonts) document.fonts.ready.then(() => {});
  requestAnimationFrame(draw);
})();
