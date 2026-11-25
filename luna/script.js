/* =========================================================
   Tú eres la luna 🌙
   Cambia aquí nombres y textos. **dobles asteriscos** = resaltado en la carta.
   whatsapp: tu número con código de país, sin + ni espacios
   (ej. "573001234567"). Si lo dejas vacío, el botón no aparece.
   ========================================================= */
const CONFIG = {
  para: "Sandy",
  de: "Johnatan",
  whatsapp: "",
  fases: [
    { nombre: "Luna nueva", f: 0, msg: "Hay noches en que no te sientes brillar. Pero la luna nunca deja de estar completa, aunque no se vea. Tú tampoco." },
    { nombre: "Luna creciente", f: 0.2, msg: "Cada paso que das cuenta. Hasta la luna crece de a poquito, y nadie le dice que va lento." },
    { nombre: "Cuarto creciente", f: 0.5, msg: "Mira todo lo que ya iluminas… y todavía vas por la mitad del camino." },
    { nombre: "Luna gibosa", f: 0.8, msg: "Ya casi. Todo lo que estás construyendo va a brillar muchísimo. Yo ya lo estoy viendo." },
    { nombre: "Luna llena", f: 1, msg: "Ahí está: la que más brilla de todas. Eres tú, Sandy, y siempre has sido tú." },
  ],
  titulos: ["Toca la luna", "Sigue tocándola", "Mira cómo crece", "Un poquito más", "Entre millones de estrellas, tú eres la luna"],
  piropos: [
    "Brillas más que la luna, y eso que ella es profesional ✨",
    "Dato curioso: la luna te tiene envidia 🌙",
    "Si la noche se pone oscura, tú la iluminas.",
    "Hoy y siempre: vas a poder con todo 💛",
    "La luna sale todas las noches. Yo también estoy, todas.",
    "Nadie brilla como tú. Nadie.",
  ],
  senal: [
    { t: "🤗 Un abrazo", r: "Te mando el abrazo más largo que exista. Y cuando nos veamos, te lo doy en persona, sin límite de tiempo." },
    { t: "👂 Que me escuches", r: "Cuéntame todo, lo grande y lo chiquito. No necesitas las palabras perfectas: yo te escucho igual." },
    { t: "💪 Ánimo", r: "Tú puedes con esto. Y si un día sientes que no, lo cargamos entre los dos." },
    { t: "🌙 Compañía", r: "No tenemos que hablar de nada. Me quedo aquí, como la luna: sin hacer ruido, pero sin irme." },
    { t: "😄 Reírme un rato", r: "Prepárate, porque tengo chistes malos de sobra y cero vergüenza de usarlos." },
  ],
  carta: [
    "¿Sabías que la luna no tiene luz propia? Brilla porque refleja la del sol. Tú no: **tú brillas sola**, y además le prestas luz a todo el que tienes cerca.",
    "Sé que a veces las cosas pesan y hay noches en que te sientes en luna nueva. En esas noches recuerda esto: sigues completa, sigues siendo tú, y nada de lo que eres deja de brillar porque no se vea un rato.",
    "Y no estás sola. **Para lo que necesites, a la hora que sea, aquí estoy**: para escucharte, para acompañarte, para hacerte reír o para quedarme en silencio a tu lado.",
    "Ve por todo. Vas a ser la mejor… porque ya lo eres.",
  ],
};

/* ---------- utilidades ---------- */
const $ = (s) => document.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const els = {
  moonHit: $("#moonHit"),
  eyebrow: $("#eyebrow"),
  title: $("#title"),
  card: $("#card"),
  phase: $("#phase"),
  msg: $("#msg"),
  dots: [...document.querySelectorAll("#dots i")],
  actions: $("#actions"),
  signalBtn: $("#signalBtn"),
  letterBtn: $("#letterBtn"),
  signal: $("#signal"),
  options: $("#options"),
  reply: $("#reply"),
  waBtn: $("#waBtn"),
  letter: $("#letter"),
  toast: $("#toast"),
  soundBtn: $("#soundBtn"),
};
els.eyebrow.textContent = `para ${CONFIG.para}`;

/* =========================================================
   Sonidos (Web Audio, sin archivos)
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
  note(f, start, dur, vol, type = "sine") {
    const c = this.ctx;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(c.destination);
    o.start(start);
    o.stop(start + dur + 0.05);
  },
  chime(notes, gap = 0.11) {
    if (!this.on || !this.init()) return;
    const t = this.ctx.currentTime;
    notes.forEach((f, i) => {
      this.note(f, t + i * gap, 1.6, 0.13);
      this.note(f * 2, t + i * gap, 0.9, 0.03);
    });
  },
  pad() {
    if (!this.on || !this.init()) return;
    const t = this.ctx.currentTime;
    [261.63, 329.63, 392, 493.88, 659.25].forEach((f, i) => this.note(f, t + i * 0.16, 5.5, 0.055, i % 2 ? "triangle" : "sine"));
  },
  twinkle() {
    if (!this.on || !this.init()) return;
    const s = [1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];
    const f = s[Math.floor(Math.random() * s.length)];
    const t = this.ctx.currentTime;
    this.note(f, t, 1.3, 0.1);
    this.note(f * 2, t, 0.7, 0.025);
  },
};
els.soundBtn.addEventListener("click", () => {
  Sound.on = !Sound.on;
  els.soundBtn.setAttribute("aria-pressed", String(Sound.on));
  els.soundBtn.setAttribute("aria-label", Sound.on ? "Sonido activado" : "Sonido desactivado");
  if (Sound.on) Sound.twinkle();
});

/* =========================================================
   La escena: cielo, montañas, lago y la luna
   ========================================================= */
const Scene = (() => {
  const canvas = $("#sky");
  const ctx = canvas.getContext("2d");
  const bg = document.createElement("canvas");
  const bgx = bg.getContext("2d");
  let moonTex = null;

  let w = 0, h = 0, dpr = 1;
  let mx = 0, my = 0, R = 0, hz = 0; // centro y radio de la luna, línea del horizonte
  let stars = [], shooting = [], waves = [];
  let f = 0, fFrom = 0, fTo = 0, fT0 = 0, fDur = 1600; // fase iluminada 0..1
  let boost = 0; // brillo extra (luna llena / señal)
  let running = false;

  // azar con semilla para que la luna siempre tenga los mismos cráteres
  let seed = 21;
  const srnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = bg.width = Math.round(w * dpr);
    canvas.height = bg.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const land = w > h && h < 560;
    R = Math.min(w * 0.28, h * (land ? 0.2 : 0.155), 165);
    mx = w / 2;
    my = land ? h * 0.36 : Math.max(h * 0.27, R + 96);
    hz = h * (land ? 0.82 : 0.8);
    // la tarjeta va justo debajo de la luna
    document.documentElement.style.setProperty("--card-top", `${Math.round(my + R + Math.max(26, R * 0.3))}px`);
    const hit = els.moonHit.style;
    hit.left = `${mx - R}px`;
    hit.top = `${my - R}px`;
    hit.width = hit.height = `${R * 2}px`;
  }

  function buildMoon() {
    const S = Math.ceil(R * 2 * dpr);
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const x = c.getContext("2d");
    x.scale(S / (R * 2), S / (R * 2));
    x.beginPath();
    x.arc(R, R, R, 0, Math.PI * 2);
    x.clip();
    let g = x.createRadialGradient(R * 0.8, R * 0.75, R * 0.1, R, R, R);
    g.addColorStop(0, "#fffbef");
    g.addColorStop(0.6, "#efe7d1");
    g.addColorStop(1, "#d3c9b1");
    x.fillStyle = g;
    x.fillRect(0, 0, R * 2, R * 2);
    seed = 21;
    // "mares" (manchas grandes)
    for (let i = 0; i < 9; i++) {
      const a = srnd() * Math.PI * 2, d = srnd() * R * 0.6;
      const px = R + Math.cos(a) * d, py = R + Math.sin(a) * d, pr = R * (0.14 + srnd() * 0.2);
      g = x.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, "rgba(150,140,128,.26)");
      g.addColorStop(0.7, "rgba(150,140,128,.14)");
      g.addColorStop(1, "rgba(150,140,128,0)");
      x.fillStyle = g;
      x.beginPath();
      x.arc(px, py, pr, 0, Math.PI * 2);
      x.fill();
    }
    // cráteres
    for (let i = 0; i < 70; i++) {
      const a = srnd() * Math.PI * 2, d = Math.sqrt(srnd()) * R * 0.95;
      const px = R + Math.cos(a) * d, py = R + Math.sin(a) * d, pr = R * (0.012 + srnd() * srnd() * 0.08);
      x.fillStyle = "rgba(120,112,104,.22)";
      x.beginPath();
      x.arc(px, py, pr, 0, Math.PI * 2);
      x.fill();
      x.strokeStyle = "rgba(255,255,255,.28)";
      x.lineWidth = Math.max(0.6, pr * 0.25);
      x.beginPath();
      x.arc(px + pr * 0.12, py + pr * 0.12, pr, Math.PI * 0.85, Math.PI * 1.75);
      x.stroke();
    }
    // grano
    for (let i = 0; i < R * 24; i++) {
      x.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.06)";
      x.fillRect(Math.random() * R * 2, Math.random() * R * 2, 1, 1);
    }
    // borde más oscuro
    g = x.createRadialGradient(R, R, R * 0.55, R, R, R);
    g.addColorStop(0, "rgba(60,50,40,0)");
    g.addColorStop(1, "rgba(60,50,40,.28)");
    x.fillStyle = g;
    x.fillRect(0, 0, R * 2, R * 2);
    moonTex = c;
  }

  function buildBackground() {
    const c = bgx;
    // cielo
    let g = c.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, "#060924");
    g.addColorStop(0.45, "#111848");
    g.addColorStop(0.8, "#262a69");
    g.addColorStop(1, "#4b3f84");
    c.fillStyle = g;
    c.fillRect(0, 0, w, hz);
    // brillo en el horizonte
    g = c.createRadialGradient(w / 2, hz, 0, w / 2, hz, Math.max(w, h) * 0.6);
    g.addColorStop(0, "rgba(255,170,190,.22)");
    g.addColorStop(1, "rgba(255,170,190,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, hz);
    // estrellas fijas
    const n = Math.round((w * hz) / 1800);
    for (let i = 0; i < n; i++) {
      const y = Math.pow(Math.random(), 1.4) * hz * 0.95;
      c.globalAlpha = rand(0.15, 0.75) * (1 - y / hz * 0.6);
      c.fillStyle = Math.random() < 0.85 ? "#fff" : "#ffe2b5";
      const s = Math.random() < 0.93 ? rand(0.5, 1.1) : rand(1.2, 1.9);
      c.fillRect(rand(0, w), y, s, s);
    }
    c.globalAlpha = 1;
    // montañas (dos capas)
    const ridge = (base, amp, color, seedOff) => {
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, hz + 1);
      for (let x = 0; x <= w + 10; x += 8) {
        const t = x / w;
        const y = base
          - amp * (0.55 * Math.sin(t * 5.3 + seedOff) + 0.3 * Math.sin(t * 13.1 + seedOff * 2) + 0.15 * Math.sin(t * 29 + seedOff * 3))
          - amp * 0.6;
        c.lineTo(x, y);
      }
      c.lineTo(w, hz + 1);
      c.closePath();
      c.fill();
    };
    ridge(hz, h * 0.05, "#1d1f4d", 1.3);
    ridge(hz, h * 0.028, "#12143a", 4.1);
    // lago
    g = c.createLinearGradient(0, hz, 0, h);
    g.addColorStop(0, "#1a1d4c");
    g.addColorStop(0.25, "#0f1236");
    g.addColorStop(1, "#050717");
    c.fillStyle = g;
    c.fillRect(0, hz, w, h - hz);
    c.fillStyle = "rgba(255,255,255,.08)";
    c.fillRect(0, hz, w, 1);

    stars = Array.from({ length: Math.round((w * hz) / 7000) + 20 }, () => {
      const y = Math.pow(Math.random(), 1.3) * hz * 0.9;
      return { x: rand(0, w), y, s: rand(0.8, 2), ph: rand(0, 6.28), sp: rand(0.0012, 0.003), big: Math.random() < 0.12 };
    });
  }

  function build() {
    size();
    buildMoon();
    buildBackground();
  }

  /* ----- sombra de la fase (iluminada del lado derecho) ----- */
  function shadowPath(k) {
    ctx.beginPath();
    ctx.arc(mx, my, R, -Math.PI / 2, Math.PI / 2, true);
    ctx.ellipse(mx, my, R * Math.abs(k), R, 0, Math.PI / 2, -Math.PI / 2, k > 0);
    ctx.closePath();
  }

  function drawMoon(t) {
    const lit = f;
    // halo
    const glow = 0.12 + lit * 0.55 + boost * 0.35;
    const gr = R * (2.6 + lit * 1.4 + boost);
    let g = ctx.createRadialGradient(mx, my, R * 0.9, mx, my, gr);
    g.addColorStop(0, `rgba(255,236,190,${0.5 * glow})`);
    g.addColorStop(0.35, `rgba(255,214,170,${0.18 * glow})`);
    g.addColorStop(1, "rgba(255,214,170,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mx, my, gr, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // la luna
    ctx.drawImage(moonTex, mx - R, my - R, R * 2, R * 2);
    if (lit < 0.999) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(mx, my, R + 0.5, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "rgba(9,11,32,.58)";
      const k = 1 - 2 * lit;
      for (const d of [-0.045, 0, 0.045]) {
        const kk = Math.max(-1, Math.min(1, k + d));
        shadowPath(kk);
        ctx.fill();
      }
      ctx.restore();
      // borde tenue del lado oscuro (luz de la Tierra)
      ctx.strokeStyle = `rgba(170,185,255,${0.18 * (1 - lit)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(mx, my, R, Math.PI / 2, Math.PI * 1.5);
      ctx.stroke();
    }
  }

  function drawReflection(t) {
    const lit = Math.max(0.06, f) + boost * 0.3;
    const N = 26;
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < N; i++) {
      const p = i / N;
      const y = hz + 3 + Math.pow(p, 1.25) * (h - hz - 6);
      const wob = 0.55 + 0.45 * Math.sin(t * 0.0021 + i * 1.7) * Math.sin(t * 0.0013 + i * 0.6);
      const half = R * (0.35 + p * 0.9) * (0.4 + 0.6 * lit) * wob;
      const off = Math.sin(t * 0.0017 + i * 2.3) * R * 0.12 * p;
      const a = lit * 0.55 * (1 - p * 0.75) * (0.5 + 0.5 * wob);
      const g = ctx.createLinearGradient(mx - half + off, 0, mx + half + off, 0);
      g.addColorStop(0, "rgba(255,236,190,0)");
      g.addColorStop(0.5, `rgba(255,236,190,${a})`);
      g.addColorStop(1, "rgba(255,236,190,0)");
      ctx.fillStyle = g;
      ctx.fillRect(mx - half + off, y, half * 2, 1.6 + p * 2.5);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function drawStars(t) {
    ctx.globalCompositeOperation = "lighter";
    for (const s of stars) {
      // cerca de la luna llena, las estrellas se ven un poco menos
      const near = Math.hypot(s.x - mx, s.y - my) / (R * 3.2);
      const dim = near < 1 ? 0.35 + 0.65 * near + (1 - f) * 0.4 : 1;
      const a = (0.3 + 0.7 * Math.abs(Math.sin(t * s.sp + s.ph))) * Math.min(1, dim);
      ctx.globalAlpha = a;
      ctx.fillStyle = "#fff";
      ctx.fillRect(s.x, s.y, s.s, s.s);
      if (s.big) {
        ctx.globalAlpha = a * 0.6;
        ctx.fillRect(s.x - s.s * 1.5, s.y + s.s / 2 - 0.4, s.s * 4, 0.8);
        ctx.fillRect(s.x + s.s / 2 - 0.4, s.y - s.s * 1.5, 0.8, s.s * 4);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function drawShooting() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    for (let i = shooting.length - 1; i >= 0; i--) {
      const s = shooting[i];
      s.x += s.vx; s.y += s.vy; s.life -= 0.013;
      if (s.life <= 0) { shooting.splice(i, 1); continue; }
      const tx = s.x - s.vx * 10, ty = s.y - s.vy * 10;
      const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, `rgba(255,255,255,${s.life})`);
      g.addColorStop(1, "rgba(255,220,200,0)");
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWaves() {
    for (let i = waves.length - 1; i >= 0; i--) {
      const wv = waves[i];
      wv.r += wv.v;
      wv.a -= 0.008;
      if (wv.a <= 0) { waves.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(255,230,180,${wv.a})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mx, my, wv.r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  let nextShoot = 0;
  function loop(t) {
    if (!running) return;
    if (fDur && t - fT0 < fDur) f = fFrom + (fTo - fFrom) * easeInOutCubic((t - fT0) / fDur);
    else f = fTo;
    boost *= 0.985;
    if (t > nextShoot && !reducedMotion) {
      const left = Math.random() < 0.5, sp = rand(8, 12), a = rand(0.25, 0.5);
      shooting.push({ x: left ? rand(-40, w * 0.4) : rand(w * 0.6, w + 40), y: rand(0, hz * 0.4), vx: (left ? 1 : -1) * Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1 });
      nextShoot = t + rand(5000, 10000);
    }
    ctx.drawImage(bg, 0, 0, w, h);
    drawStars(t);
    drawShooting();
    drawMoon(t);
    drawWaves();
    drawReflection(t);
    requestAnimationFrame(loop);
  }

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(build, 150);
  });

  return {
    canvas,
    build,
    start() { running = true; nextShoot = performance.now() + 3000; requestAnimationFrame(loop); },
    setPhase(target, dur = 1600) {
      fFrom = f;
      fTo = target;
      fT0 = performance.now();
      fDur = reducedMotion ? 1 : dur;
    },
    pulse(n = 3, strength = 1) {
      boost = Math.min(1.4, boost + strength);
      for (let i = 0; i < n; i++) setTimeout(() => waves.push({ r: R * 1.02, v: R * 0.018, a: 0.6 }), i * 380);
    },
    hasShooting() { return shooting.some((s) => s.life > 0.25); },
  };
})();

Scene.build();
Scene.start();

/* =========================================================
   Toast
   ========================================================= */
let toastTimer;
function toast(msg, ms = 3200) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), ms);
}

/* =========================================================
   Tocar la luna: la luna crece fase por fase
   ========================================================= */
let step = 0;
let busy = false;
const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

async function swapText(el, text) {
  el.classList.add("swap");
  await sleep(reducedMotion ? 0 : 450);
  el.textContent = text;
  el.classList.remove("swap");
}

async function tapMoon() {
  if (busy) return;
  const fases = CONFIG.fases;
  if (step >= fases.length - 1) {
    // ya está llena: un piropo cada vez que la toque
    Scene.pulse(1, 0.4);
    Sound.twinkle();
    toast(CONFIG.piropos[Math.floor(Math.random() * CONFIG.piropos.length)]);
    return;
  }
  busy = true;
  step++;
  const fase = fases[step];
  Scene.setPhase(fase.f);
  Scene.pulse(1, 0.25);
  Sound.chime(NOTES.slice(0, step + 1), 0.09);
  if (navigator.vibrate) navigator.vibrate(10);
  els.dots.forEach((d, i) => d.classList.toggle("on", i <= step));

  els.card.classList.add("swap");
  swapText(els.title, CONFIG.titulos[step]);
  await sleep(reducedMotion ? 0 : 450);
  els.phase.textContent = fase.nombre;
  els.msg.textContent = fase.msg;
  els.card.classList.remove("swap");

  if (step === fases.length - 1) {
    // ¡luna llena!
    await sleep(reducedMotion ? 0 : 900);
    els.title.classList.add("final");
    Scene.pulse(4, 1.2);
    Sound.pad();
    els.moonHit.classList.add("done");
    await sleep(reducedMotion ? 0 : 1800);
    els.actions.classList.add("show");
    setTimeout(() => toast("Psst… la luna llena también se puede tocar 🌙"), 2500);
  }
  await sleep(reducedMotion ? 0 : 900);
  busy = false;
}
els.moonHit.addEventListener("click", tapMoon);

// tocar el cielo mientras pasa una estrella fugaz = deseo
Scene.canvas.addEventListener("pointerdown", () => {
  if (Scene.hasShooting()) {
    Sound.twinkle();
    toast("¡Deseo pedido! Yo pedí el mismo: que todo te salga increíble ✨");
  }
});

/* =========================================================
   Ventanas
   ========================================================= */
function openModal(el) {
  el.hidden = false;
  el.querySelector("[data-close]").focus({ preventScroll: true });
}
function closeModal(el) { el.hidden = true; }
document.querySelectorAll(".modal").forEach((m) => {
  m.addEventListener("click", (e) => {
    if (e.target === m || e.target.closest("[data-close]")) closeModal(m);
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll(".modal:not([hidden])").forEach(closeModal);
});

/* ---------- la señal de la luna ---------- */
CONFIG.senal.forEach((o) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "opt";
  b.textContent = o.t;
  b.addEventListener("click", () => {
    els.options.querySelectorAll(".opt").forEach((x) => x.classList.toggle("active", x === b));
    els.reply.classList.remove("pop");
    void els.reply.offsetWidth;
    els.reply.textContent = o.r;
    els.reply.classList.add("show", "pop");
    Sound.twinkle();
    Scene.pulse(1, 0.3);
    if (CONFIG.whatsapp) {
      const txt = `🌙 Encendí la señal de la luna: ${o.t.replace(/^\S+\s/, "")}`;
      els.waBtn.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`;
      els.waBtn.hidden = false;
    }
  });
  els.options.appendChild(b);
});

els.signalBtn.addEventListener("click", async () => {
  Scene.pulse(5, 1.4);
  Sound.chime([392, 523.25, 659.25, 783.99, 1046.5], 0.12);
  if (navigator.vibrate) navigator.vibrate([20, 60, 20]);
  await sleep(reducedMotion ? 0 : 650);
  els.reply.classList.remove("show");
  els.options.querySelectorAll(".opt").forEach((x) => x.classList.remove("active"));
  if (CONFIG.whatsapp) {
    els.waBtn.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("🌙 Encendí la señal de la luna")}`;
    els.waBtn.hidden = false;
  }
  openModal(els.signal);
});

/* ---------- la carta ---------- */
els.letterBtn.addEventListener("click", () => {
  $("#letterTitle").textContent = `${CONFIG.para}:`;
  const body = $("#letterBody");
  body.innerHTML = "";
  CONFIG.carta.forEach((line, i) => {
    const p = document.createElement("p");
    p.style.animationDelay = `${0.2 + i * 0.35}s`;
    line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).forEach((seg) => {
      if (seg.startsWith("**")) {
        const s = document.createElement("span");
        s.className = "hl";
        s.textContent = seg.slice(2, -2);
        p.appendChild(s);
      } else p.appendChild(document.createTextNode(seg));
    });
    body.appendChild(p);
  });
  $("#letterSign").textContent = `— ${CONFIG.de} 🌙`;
  Sound.twinkle();
  openModal(els.letter);
});
