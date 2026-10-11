/* =========================================================
   Cartita de gatito 🐾
   Cambia aquí los nombres o el texto si quieres.
   Usa **dobles asteriscos** para resaltar una frase.
   ========================================================= */
const CONFIG = {
  para: "Sandy",
  de: "Johnatan",
  carta: [
    "Querida Sandy:",
    "Este gatito vino corriendo a traerte un mensaje muy importante, así que escúchalo bien (bueno, léelo 🐾).",
    "Sé que a veces las cosas se sienten pesadas y que hay días en los que todo parece cuesta arriba. Pero quiero que sepas algo: **eres mucho más fuerte de lo que crees.**",
    "Cada esfuerzo que haces, cada noche de cansancio y cada paso que das, aunque parezca pequeño, vale la pena. Lo estás haciendo increíble, aunque a veces no lo veas.",
    "Y si un día te tropiezas, no pasa nada. Los gatitos también se caen… y siempre caen de pie. Tú también lo vas a hacer.",
    "Así que respira hondo, porque **todo te va a salir bien.** No lo digo por decir: lo digo porque sé de lo que eres capaz.",
    "Aquí estoy para ti, para lo que necesites, siempre.",
  ],
  animos: [
    "Eres capaz de mucho más de lo que imaginas ✨",
    "Respira. Un pasito a la vez 🐾",
    "Lo que hoy pesa, mañana será una historia que contarás sonriendo.",
    "Descansar también es avanzar. Date permiso 🌙",
    "Tu sonrisa arregla días enteros (doy fe).",
    "Lo difícil no es para siempre. Tú sí eres fuerte para siempre 💪",
    "Mereces cosas bonitas, y van a llegar 🌷",
    "Miau = todo va a salir bien. (Traducción oficial del gatito.)",
    "No tienes que poder con todo hoy. Solo con lo de hoy.",
    "Eres luz, incluso en los días nublados ☀️",
    "Si dudas de ti, pregúntame a mí: yo no tengo dudas 💛",
    "Un gatito cree en ti. Y un gatito nunca se equivoca 😼",
  ],
};

/* ---------- utilidades ---------- */
const $ = (s) => document.querySelector(s);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a, b) => a + Math.random() * (b - a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const els = {
  cat: $("#cat"),
  envelope: $("#envelope"),
  envelopeZone: $("#envelopeZone"),
  letterZone: $("#letterZone"),
  paper: $("#paper"),
  text: $("#letterText"),
  actions: $("#actions"),
  jarBtn: $("#jarBtn"),
  jarNote: $("#jarNote"),
  promiseBtn: $("#promiseBtn"),
  finale: $("#finale"),
  againBtn: $("#againBtn"),
  toast: $("#toast"),
  soundBtn: $("#soundBtn"),
  mimos: $("#mimos"),
  mimosCount: $("#mimosCount"),
};

$("#toName").textContent = CONFIG.para;
$("#fromName").textContent = CONFIG.de;

/* =========================================================
   Sonidos (Web Audio, sin archivos externos)
   ========================================================= */
const Sound = {
  ctx: null,
  on: true,
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },
  chime(notes = [659.25, 783.99, 1046.5], gap = 0.12) {
    if (!this.on || !this.init()) return;
    const t0 = this.ctx.currentTime;
    notes.forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t = t0 + i * gap;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g).connect(this.ctx.destination);
      o.start(t);
      o.stop(t + 1);
    });
  },
  purr(duration = 1.3) {
    if (!this.on || !this.init()) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 280;

    // modulación ~24 Hz: el "rrrr" del ronroneo
    const am = ctx.createGain();
    am.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 24;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    lfo.connect(lfoGain).connect(am.gain);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.9, t + 0.15);
    env.gain.setValueAtTime(0.9, t + duration - 0.35);
    env.gain.linearRampToValueAtTime(0, t + duration);

    src.connect(lp).connect(am).connect(env).connect(ctx.destination);
    src.start(t);
    lfo.start(t);
    src.stop(t + duration);
    lfo.stop(t + duration);
  },
  tick() {
    if (!this.on || !this.init()) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const t = this.ctx.currentTime;
    o.type = "triangle";
    o.frequency.value = rand(1500, 1900);
    g.gain.setValueAtTime(0.025, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g).connect(this.ctx.destination);
    o.start(t);
    o.stop(t + 0.06);
  },
};

els.soundBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  Sound.on = !Sound.on;
  els.soundBtn.setAttribute("aria-pressed", String(Sound.on));
  els.soundBtn.setAttribute("aria-label", Sound.on ? "Sonido activado" : "Sonido desactivado");
  if (Sound.on) Sound.chime([880], 0);
});

/* =========================================================
   Efectos en canvas: corazones, huellitas y destellos
   ========================================================= */
const FX = (() => {
  const canvas = $("#fx");
  const ctx = canvas.getContext("2d");
  const parts = [];
  const colors = ["#ff6f8e", "#ffc861", "#b79cf2", "#ffb3c1", "#ffd6a5", "#ffffff"];
  let w = 0, h = 0, dpr = 1, running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function heart(s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.45, -s * 1.05, 0, -s * 0.45);
    ctx.bezierCurveTo(s * 0.45, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35);
    ctx.fill();
  }
  function paw(s) {
    ctx.beginPath(); ctx.ellipse(0, s * 0.25, s * 0.45, s * 0.38, 0, 0, Math.PI * 2); ctx.fill();
    [[-0.5, -0.2], [-0.2, -0.5], [0.2, -0.5], [0.5, -0.2]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x * s, y * s, s * 0.18, 0, Math.PI * 2); ctx.fill();
    });
  }
  function spark(s) {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
      ctx.lineTo(Math.cos(a + Math.PI / 4) * s * 0.3, Math.sin(a + Math.PI / 4) * s * 0.3);
    }
    ctx.closePath();
    ctx.fill();
  }
  const draw = { heart, paw, spark };

  function add(p) {
    parts.push(Object.assign({ rot: 0, vr: 0, g: 0, life: 1, decay: 0.01, drag: 0.99 }, p));
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.vr;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > h + 40 || p.y < -60) { parts.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      draw[p.type](p.size);
      ctx.restore();
    }
    if (parts.length) requestAnimationFrame(loop);
    else { running = false; ctx.clearRect(0, 0, w, h); }
  }

  return {
    burst(x, y, n = 14, types = ["heart"]) {
      if (reducedMotion) n = Math.min(n, 4);
      for (let i = 0; i < n; i++) {
        const a = rand(-Math.PI, 0);
        const sp = rand(2, 6);
        add({
          x, y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1,
          g: 0.06, drag: 0.98,
          size: rand(7, 13),
          type: types[i % types.length],
          color: colors[Math.floor(rand(0, colors.length - 1))],
          vr: rand(-0.05, 0.05), decay: rand(0.008, 0.015),
        });
      }
    },
    confetti(n = 140) {
      if (reducedMotion) n = 20;
      for (let i = 0; i < n; i++) {
        add({
          x: rand(0, w), y: rand(-h * 0.5, -10),
          vx: rand(-1.2, 1.2), vy: rand(1.5, 4),
          g: 0.03, drag: 0.995,
          size: rand(7, 14),
          type: ["heart", "paw", "spark"][i % 3],
          color: colors[i % colors.length],
          rot: rand(0, 6), vr: rand(-0.06, 0.06), decay: 0.0035,
        });
      }
    },
    ambient() {
      if (reducedMotion) return;
      setInterval(() => {
        if (document.hidden) return;
        add({
          x: rand(0, w), y: h + 10,
          vx: rand(-0.3, 0.3), vy: rand(-0.6, -1.2),
          size: rand(3, 6), type: Math.random() < 0.7 ? "spark" : "heart",
          color: Math.random() < 0.5 ? "#ffffff" : "#ffd6a5",
          vr: rand(-0.02, 0.02), decay: 0.003, drag: 1,
        });
      }, 700);
    },
  };
})();
FX.ambient();

/* =========================================================
   El gatito: mira hacia donde tocas y ronronea con mimos
   ========================================================= */
const pupils = document.querySelectorAll(".pupil");
function lookAt(x, y) {
  const r = els.cat.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height * 0.42;
  const a = Math.atan2(y - cy, x - cx);
  const d = Math.min(1, Math.hypot(x - cx, y - cy) / 300);
  const dx = Math.cos(a) * 3.2 * d;
  const dy = Math.sin(a) * 3.6 * d;
  pupils.forEach((p) => (p.style.transform = `translate(${dx}px, ${dy}px)`));
}
window.addEventListener("pointermove", (e) => lookAt(e.clientX, e.clientY), { passive: true });

let mimos = 0;
let happyTimer;
const mimoMsgs = {
  5: "El gatito dice que le caes muy bien 😸",
  10: "Prrr… el gatito ya es tuyo oficialmente 💛",
  20: "¡20 mimos! Nivel: mejor amiga de gatos 🏆",
  50: "50 mimos… el gatito se derritió de amor 🫠",
};

els.cat.addEventListener("click", (e) => {
  e.stopPropagation();
  mimos++;
  els.mimos.hidden = false;
  els.mimosCount.textContent = mimos;

  els.cat.classList.remove("is-happy");
  void els.cat.offsetWidth; // reinicia la animación
  els.cat.classList.add("is-happy");
  clearTimeout(happyTimer);
  happyTimer = setTimeout(() => els.cat.classList.remove("is-happy"), 1400);

  const r = els.cat.getBoundingClientRect();
  FX.burst(r.left + r.width / 2, r.top + r.height * 0.3, 12, ["heart", "heart", "paw"]);
  Sound.purr();
  if (navigator.vibrate) navigator.vibrate([12, 40, 12]);
  if (mimoMsgs[mimos]) toast(mimoMsgs[mimos]);
});

/* Huellitas donde toques el fondo */
const PAW_SVG = '<svg viewBox="0 0 40 40" fill="currentColor"><ellipse cx="20" cy="25" rx="8" ry="7"/><circle cx="11" cy="16" r="3.6"/><circle cx="17" cy="11" r="3.6"/><circle cx="24" cy="11" r="3.6"/><circle cx="30" cy="16" r="3.6"/></svg>';
document.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button, .paper, .finale-card, .jar-card, .promise")) return;
  const p = document.createElement("div");
  p.className = "paw-print";
  p.innerHTML = PAW_SVG;
  p.style.left = e.clientX + "px";
  p.style.top = e.clientY + "px";
  p.style.setProperty("--r", `${rand(-30, 30)}deg`);
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1500);
  lookAt(e.clientX, e.clientY);
});

/* =========================================================
   Toast
   ========================================================= */
let toastTimer;
function toast(msg, ms = 2800) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), ms);
}

/* =========================================================
   Abrir el sobre
   ========================================================= */
let opened = false;
els.envelope.addEventListener("click", async (e) => {
  e.stopPropagation();
  if (opened) return;
  opened = true;
  Sound.chime();
  els.envelope.classList.add("open");
  const r = els.envelope.getBoundingClientRect();
  FX.burst(r.left + r.width / 2, r.top + r.height * 0.3, 18, ["heart", "spark"]);

  await sleep(reducedMotion ? 50 : 1500);
  els.envelopeZone.classList.add("leaving");
  await sleep(reducedMotion ? 10 : 550);
  els.envelopeZone.hidden = true;
  document.body.classList.add("opened");
  els.letterZone.hidden = false;
  els.letterZone.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  await sleep(reducedMotion ? 10 : 700);
  typeLetter();
});

/* =========================================================
   Escribir la carta letra por letra
   ========================================================= */
function parse(line) {
  // "**texto**" -> resaltado
  return line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((t) =>
    t.startsWith("**") ? { text: t.slice(2, -2), hl: true } : { text: t, hl: false }
  );
}

let skip = false;
let typing = false;

function renderAllAtOnce() {
  els.text.innerHTML = "";
  CONFIG.carta.forEach((line) => {
    const p = document.createElement("p");
    parse(line).forEach((seg) => {
      if (seg.hl) {
        const s = document.createElement("span");
        s.className = "hl";
        s.textContent = seg.text;
        p.appendChild(s);
      } else p.appendChild(document.createTextNode(seg.text));
    });
    els.text.appendChild(p);
  });
}

async function typeLetter() {
  typing = true;
  if (reducedMotion) skip = true;
  els.text.innerHTML = "";
  const caret = document.createElement("span");
  caret.className = "caret";

  for (const line of CONFIG.carta) {
    if (skip) break;
    const p = document.createElement("p");
    els.text.appendChild(p);
    for (const seg of parse(line)) {
      if (skip) break;
      const holder = seg.hl ? Object.assign(document.createElement("span"), { className: "hl" }) : document.createElement("span");
      p.appendChild(holder);
      const node = document.createTextNode("");
      holder.appendChild(node);
      holder.appendChild(caret);
      for (const ch of seg.text) {
        if (skip) break;
        node.data += ch;
        if (ch !== " " && Math.random() < 0.35) Sound.tick();
        await sleep(/[.,:…!?]/.test(ch) ? 260 : rand(22, 42));
      }
    }
    await sleep(skip ? 0 : 420);
  }

  if (skip) renderAllAtOnce();
  caret.remove();
  typing = false;
  finishLetter();
}

function finishLetter() {
  els.paper.classList.add("done");
  els.actions.classList.add("show");
  Sound.chime([523.25, 659.25, 783.99, 1046.5], 0.1);
  setTimeout(() => toast("Psst… acaricia al gatito 🐾"), 1600);
}

els.paper.addEventListener("click", () => {
  if (typing) skip = true;
});

/* =========================================================
   Frasco de ánimos
   ========================================================= */
let pool = [];
els.jarBtn.addEventListener("click", (e) => {
  if (!pool.length) pool = [...CONFIG.animos].sort(() => Math.random() - 0.5);
  const msg = pool.pop();
  els.jarBtn.classList.remove("shake");
  void els.jarBtn.offsetWidth;
  els.jarBtn.classList.add("shake");

  els.jarNote.classList.remove("flip");
  void els.jarNote.offsetWidth;
  els.jarNote.textContent = msg;
  els.jarNote.classList.add("show", "flip");

  const r = els.jarBtn.getBoundingClientRect();
  FX.burst(r.left + 34, r.top + 20, 8, ["heart", "spark"]);
  Sound.chime([987.77, 1318.5], 0.08);
});

/* =========================================================
   La promesa final
   ========================================================= */
els.promiseBtn.addEventListener("click", () => {
  els.finale.hidden = false;
  FX.confetti();
  Sound.chime([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.11);
  setTimeout(() => Sound.purr(1.8), 600);
  if (navigator.vibrate) navigator.vibrate([20, 60, 20, 60, 40]);
  els.againBtn.focus({ preventScroll: true });
});

function closeFinale() {
  els.finale.hidden = true;
  els.paper.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
}
els.againBtn.addEventListener("click", closeFinale);
els.finale.addEventListener("click", (e) => { if (e.target === els.finale) closeFinale(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !els.finale.hidden) closeFinale(); });
