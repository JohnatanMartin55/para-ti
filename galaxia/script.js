/* =========================================================
   Te extraño poquito… 🦔✨
   Cambia aquí los nombres y los textos si quieres.
   En la carta, **dobles asteriscos** = frase resaltada.
   ========================================================= */
const CONFIG = {
  para: "Sandy",
  de: "Johnatan",
  carta: [
    "Dicen que el universo no tiene fin y que cada segundo se hace un poquito más grande. Yo no sé mucho de astronomía, pero sé que con lo que te extraño pasa exactamente lo mismo.",
    "Empieza como un poquito, de esos que caben entre dos deditos… y cuando me doy cuenta, **ya no cabe en ningún lado.**",
    "Cada estrella de este cielo es un momento en el que pensé en ti. Y créeme: me quedé corto de estrellas.",
    "Así que cuando mires el cielo de noche, acuérdate de que alguien por aquí te está extrañando **una galaxia entera.**",
  ],
  estrellas: [
    "Esta es por tu risa.",
    "Esta, por la vez que vi algo bonito y quise mostrártelo.",
    "Esta, por cuando sonó una canción que me recordó a ti.",
    "Esta, por todas las veces que pensé «ojalá estuviera aquí».",
    "Esta, por tu forma de ver las cosas.",
    "Esta, por las noches en que quise escribirte.",
    "Esta, porque sí. Porque te extraño.",
    "Esta, por la próxima vez que te vea.",
    "Esta, por lo bonito que es hablar contigo.",
    "Esta, por cada «buenos días» que te quise mandar.",
    "Esta brilla más. Adivina por quién 😌",
    "Esta, por todo lo que todavía no te he dicho.",
  ],
  constelacion: 7, // a cuántas estrellas aparece la constelación con su nombre
};

/* ---------- utilidades ---------- */
const $ = (s) => document.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeInCubic = (x) => x * x * x;
const clamp01 = (x) => Math.max(0, Math.min(1, x));

const els = {
  scene: $("#scene"),
  stage: $("#stage"),
  hog: $("#hog"),
  hogBtn: $("#hogBtn"),
  zoomBtn: $("#zoomBtn"),
  erizo: $("#erizo"),
  universe: $("#universe"),
  l1: $(".l1"),
  l2: $(".l2"),
  l3: $(".l3"),
  hint: $("#uHint"),
  count: $("#uCount"),
  countNum: $("#countNum"),
  countLbl: $("#countLbl"),
  actions: $("#uActions"),
  letterBtn: $("#letterBtn"),
  replayBtn: $("#replayBtn"),
  letter: $("#letter"),
  letterClose: $("#letterClose"),
  toast: $("#toast"),
  soundBtn: $("#soundBtn"),
};

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
  noise(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    return src;
  },
  whoosh(dur = 2.3) {
    if (!this.on || !this.init()) return;
    const c = this.ctx, t = c.currentTime;
    const src = this.noise(dur);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(250, t);
    bp.frequency.exponentialRampToValueAtTime(2600, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t);
    src.stop(t + dur);
  },
  pad() {
    if (!this.on || !this.init()) return;
    const c = this.ctx, t = c.currentTime;
    [261.63, 329.63, 392, 523.25, 659.25].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = i % 2 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = rand(-6, 6);
      const s = t + i * 0.18;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.06, s + 0.8);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 5.5);
      o.connect(g).connect(c.destination);
      o.start(s);
      o.stop(s + 6);
    });
  },
  twinkle() {
    if (!this.on || !this.init()) return;
    const c = this.ctx, t = c.currentTime;
    const scale = [1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];
    const f = scale[Math.floor(Math.random() * scale.length)];
    [f, f * 2].forEach((freq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(i ? 0.03 : 0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 1.5);
    });
  },
};

els.soundBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  Sound.on = !Sound.on;
  els.soundBtn.setAttribute("aria-pressed", String(Sound.on));
  els.soundBtn.setAttribute("aria-label", Sound.on ? "Sonido activado" : "Sonido desactivado");
  if (Sound.on) Sound.twinkle();
});

/* =========================================================
   El universo (canvas)
   La galaxia se dibuja UNA vez en una imagen y luego solo se gira
   con una transformación → muy liviano incluso en celulares.
   ========================================================= */
const Sky = (() => {
  const canvas = $("#sky");
  const ctx = canvas.getContext("2d");
  const bg = document.createElement("canvas");
  const bgx = bg.getContext("2d");

  let w = 0, h = 0, dpr = 1, cx = 0, cy = 0, R = 0, S = 0;
  let dprCap = 2;
  let diskImg = null, coreImg = null;
  let bright = [], twinklers = [], sparkles = [], shooting = [], userStars = [];
  let rot = 0, vel = 0, running = false, last = 0, nextShoot = 0;
  let reveal = null;
  const perf = { n: 0, sum: 0, checked: false };
  const TILT = 0.6;
  const PHI = -0.42;

  /* ---------- sprites (gradientes pre-dibujados) ---------- */
  function sprite(stops, size = 128) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    x.fillStyle = g;
    x.fillRect(0, 0, size, size);
    return c;
  }
  const gas = (rgb) => sprite([[0, `rgba(${rgb},1)`], [0.4, `rgba(${rgb},.35)`], [1, `rgba(${rgb},0)`]], 64);
  const SPR = {
    gas: ["255,200,170", "255,110,170", "150,110,255", "90,120,255"].map(gas),
    halo: sprite([[0, "rgba(190,130,255,.32)"], [0.45, "rgba(120,80,220,.14)"], [0.8, "rgba(80,60,200,.06)"], [1, "rgba(0,0,0,0)"]]),
    core: sprite([[0, "rgba(255,250,235,1)"], [0.15, "rgba(255,226,180,.8)"], [0.45, "rgba(255,150,150,.22)"], [1, "rgba(0,0,0,0)"]], 256),
    glowWarm: sprite([[0, "rgba(255,226,166,.9)"], [1, "rgba(255,226,166,0)"]], 64),
    glowCool: sprite([[0, "rgba(207,224,255,.9)"], [1, "rgba(207,224,255,0)"]], 64),
    glowPink: sprite([[0, "rgba(255,214,230,.6)"], [1, "rgba(255,214,230,0)"]], 64),
  };

  function starPath(c, x, y, s) {
    c.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      c.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s);
      c.lineTo(x + Math.cos(a + Math.PI / 4) * s * 0.16, y + Math.sin(a + Math.PI / 4) * s * 0.16);
    }
    c.closePath();
  }

  /* ---------- tamaño ---------- */
  function size() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    // pantallas enormes: limitamos los píxeles totales
    const maxPx = 4.2e6;
    if (w * h * dpr * dpr > maxPx) dpr = Math.max(0.75, Math.sqrt(maxPx / (w * h)));
    canvas.width = bg.width = Math.round(w * dpr);
    canvas.height = bg.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2;
    cy = h * (w < 700 ? 0.53 : 0.52);
    R = Math.min(w, h) * (w < 700 ? 0.46 : 0.4);
    S = R * 1.2;
  }

  /* ---------- galaxia pre-dibujada (vista de frente) ---------- */
  function buildGalaxy() {
    const px = Math.ceil(S * 2 * dpr);
    const mk = () => {
      const c = document.createElement("canvas");
      c.width = c.height = px;
      const x = c.getContext("2d");
      x.setTransform(dpr, 0, 0, dpr, S * dpr, S * dpr);
      x.globalCompositeOperation = "lighter";
      return [c, x];
    };
    const [dc, d] = mk();
    const [cc, c] = mk();

    // nubes de gas a lo largo de los brazos
    const cloudN = w < 700 ? 120 : 170;
    for (let i = 0; i < cloudN; i++) {
      const r = 0.12 + Math.pow(Math.random(), 0.8) * 0.9;
      const th = (Math.random() < 0.5 ? 0 : Math.PI) + r * 4.4 + gauss() * 0.3;
      const s = R * rand(0.07, 0.16) * (1.1 - r * 0.4);
      const k = r < 0.3 ? 0 : Math.random() < 0.3 ? 1 : Math.random() < 0.6 ? 2 : 3;
      d.globalAlpha = rand(0.18, 0.4);
      d.drawImage(SPR.gas[k], Math.cos(th) * r * R - s, Math.sin(th) * r * R - s, s * 2, s * 2);
    }

    const PAL = {
      core: ["#fff6e0", "#ffe2b0", "#ffd08a"],
      mid: ["#ffc2a8", "#ff9fb8", "#f58fc8"],
      outer: ["#a58af5", "#7f86f0", "#c49cf7", "#6bb6ff"],
      clump: ["#ff6fa8", "#ff8fd0"],
    };
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const N = w < 700 ? 9000 : 14000;
    bright = [];
    for (let i = 0; i < N; i++) {
      const kind = Math.random();
      const halo = kind < 0.14;
      const core = !halo && kind < 0.36;
      const r = halo ? Math.pow(Math.random(), 0.6) * 1.08
        : core ? Math.pow(Math.random(), 2.2) * 0.32
        : 0.06 + Math.pow(Math.random(), 0.85) * 0.96;
      const th = halo || core ? Math.random() * Math.PI * 2
        : (Math.random() < 0.5 ? 0 : Math.PI) + r * 4.4 + gauss() * (0.38 + 0.25 * (1 - r));
      const rr = Math.max(0.005, r + gauss() * (halo || core ? 0.02 : 0.055));
      const k = Math.random();
      const color = rr < 0.16 ? pick(PAL.core)
        : rr < 0.42 ? (k < 0.1 ? pick(PAL.clump) : pick(PAL.mid))
        : (k < 0.06 ? pick(PAL.clump) : pick(PAL.outer));
      const x = Math.cos(th) * rr * R;
      const y = Math.sin(th) * rr * R;
      const sz = rr < 0.16 ? rand(0.9, 2) : Math.random() < 0.06 ? rand(1.8, 2.6) : rand(0.6, 1.5);
      const a = halo ? rand(0.12, 0.4) : rand(0.3, 0.95);
      const ctxT = core ? c : d;
      ctxT.globalAlpha = a;
      ctxT.fillStyle = color;
      ctxT.fillRect(x, y, sz, sz);
      // unas cuantas titilan en vivo
      if (!core && !halo && Math.random() < 0.022) bright.push({ x, y, s: sz + 0.6, a: rand(0.6, 1), ph: Math.random() * 6.28, c: color });
    }
    diskImg = dc;
    coreImg = cc;
  }

  /* ---------- fondo: nebulosas, estrellas fijas, galaxias lejanas ---------- */
  function buildBackground() {
    const c = bgx;
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    c.fillStyle = "#05040f";
    c.fillRect(0, 0, w, h);
    [
      [0.2, 0.25, 0.55, "rgba(120,60,200,.16)"],
      [0.85, 0.7, 0.5, "rgba(230,80,150,.11)"],
      [0.7, 0.15, 0.4, "rgba(60,90,220,.12)"],
      [0.15, 0.85, 0.45, "rgba(90,50,180,.12)"],
    ].forEach(([x, y, r, col]) => {
      const g = c.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * Math.max(w, h));
      g.addColorStop(0, col);
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    });
    c.globalCompositeOperation = "lighter";
    const n = Math.round((w * h) / 2200);
    for (let i = 0; i < n; i++) {
      c.globalAlpha = rand(0.15, 0.7);
      c.fillStyle = Math.random() < 0.8 ? "#ffffff" : Math.random() < 0.5 ? "#ffd9a8" : "#a9c4ff";
      const s = Math.random() < 0.92 ? rand(0.4, 1) : rand(1, 1.8);
      c.fillRect(rand(0, w), rand(0, h), s, s);
    }
    for (let i = 0; i < 6; i++) {
      let x, y, tries = 0;
      do { x = rand(0, w); y = rand(0, h); } while (Math.hypot(x - cx, (y - cy) / 0.8) < R * 1.25 && ++tries < 40);
      const s = rand(10, 26);
      c.save();
      c.translate(x, y);
      c.rotate(rand(0, Math.PI));
      c.scale(1, rand(0.3, 0.55));
      const g = c.createRadialGradient(0, 0, 0, 0, 0, s);
      g.addColorStop(0, "rgba(255,235,210,.9)");
      g.addColorStop(0.35, "rgba(200,160,255,.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.globalAlpha = rand(0.5, 0.9);
      c.fillStyle = g;
      c.beginPath();
      c.arc(0, 0, s, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";

    twinklers = Array.from({ length: Math.round((w * h) / 9000) }, () => ({
      x: rand(0, w), y: rand(0, h), s: rand(0.8, 1.8), ph: Math.random() * 6.28, sp: rand(0.0012, 0.0035),
    }));
    sparkles = Array.from({ length: w < 700 ? 9 : 14 }, () => {
      let x, y, tries = 0;
      do { x = rand(0, w); y = rand(0, h); } while (Math.hypot(x - cx, y - cy) < R * 0.5 && ++tries < 40);
      const warm = Math.random() < 0.7;
      return { x, y, s: rand(5, 11), ph: Math.random() * 6.28, color: warm ? "#ffe2a6" : "#cfe0ff", glow: warm ? SPR.glowWarm : SPR.glowCool };
    });
  }

  function build() {
    size();
    buildGalaxy();
    buildBackground();
  }

  /* ---------- dibujo de cada cuadro ---------- */
  function drawGalaxy(t) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(cx, cy);
    ctx.rotate(PHI);
    ctx.scale(1, TILT);
    ctx.globalAlpha = 1;
    ctx.drawImage(SPR.halo, -R * 1.15, -R * 1.15, R * 2.3, R * 2.3);

    ctx.save();
    ctx.rotate(rot);
    ctx.drawImage(diskImg, -S, -S, S * 2, S * 2);
    for (const b of bright) {
      ctx.globalAlpha = b.a * Math.abs(Math.sin(t * 0.0016 + b.ph));
      ctx.fillStyle = b.c;
      ctx.fillRect(b.x, b.y, b.s, b.s / TILT);
    }
    ctx.restore();

    ctx.save();
    ctx.rotate(rot * 1.4);
    ctx.globalAlpha = 1;
    ctx.drawImage(coreImg, -S, -S, S * 2, S * 2);
    ctx.restore();

    const pulse = R * 0.36 * (1 + 0.03 * Math.sin(t * 0.0015));
    ctx.scale(1, 1.1);
    ctx.drawImage(SPR.core, -pulse, -pulse, pulse * 2, pulse * 2);
    ctx.restore();
  }

  function drawWorld(t) {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.drawImage(bg, 0, 0, w, h);

    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "#fff";
    for (const s of twinklers) {
      ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(t * s.sp + s.ph));
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    for (const s of sparkles) {
      const k = 0.6 + 0.4 * Math.sin(t * 0.0018 + s.ph);
      const g = s.s * k * 1.8;
      ctx.globalAlpha = 0.45 * k;
      ctx.drawImage(s.glow, s.x - g, s.y - g, g * 2, g * 2);
      ctx.globalAlpha = 0.85 * k;
      ctx.fillStyle = s.color;
      starPath(ctx, s.x, s.y, s.s * k);
      ctx.fill();
    }
    drawGalaxy(t);
  }

  function drawFrame(t) {
    if (reveal) {
      // la galaxia vive dentro del "poquito" y crece hasta llenar la pantalla
      const { x, y, rad, z, ring } = reveal;
      const fe = Math.max(1.5, rad * 0.16);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      // solo se dibuja lo que cabe dentro del círculo
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.clip();
      ctx.translate(x, y);
      ctx.scale(z, z);
      ctx.translate(-cx, -cy);
      ctx.fillStyle = "#05040f";
      ctx.fillRect(-w * 4, -h * 4, w * 9, h * 9);
      drawWorld(t);
      ctx.restore();

      // borde suave: se difumina solo el anillo del borde
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
      const m = ctx.createRadialGradient(x, y, Math.max(0, rad - fe), x, y, rad);
      m.addColorStop(0, "rgba(0,0,0,0)");
      m.addColorStop(1, "#000");
      ctx.fillStyle = m;
      const bx = Math.max(0, x - rad), by = Math.max(0, y - rad);
      ctx.fillRect(bx, by, Math.min(w, x + rad) - bx, Math.min(h, y + rad) - by);

      // halo de luz alrededor
      if (ring > 0.01) {
        ctx.globalCompositeOperation = "source-over";
        const r0 = Math.max(0, rad - fe * 1.4), r1 = rad + fe * 2.2 + 6;
        const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
        g.addColorStop(0, "rgba(255,225,240,0)");
        g.addColorStop(0.45, `rgba(255,214,236,${0.55 * ring})`);
        g.addColorStop(0.7, `rgba(205,180,255,${0.25 * ring})`);
        g.addColorStop(1, "rgba(205,180,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - r1, y - r1, r1 * 2, r1 * 2);
      }
      return;
    }
    drawWorld(t);
    drawUserStars(t);
    drawShooting();
  }

  /* ---------- estrellas que pone ella ---------- */
  function drawUserStars(t) {
    if (!userStars.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffd6e6";
    ctx.setLineDash([3, 5]);
    for (let i = 1; i < userStars.length; i++) {
      const a = userStars[i - 1], b = userStars[i];
      const k = Math.min(1, (t - b.born) / 900);
      if (k <= 0) continue;
      const ax = a.x * w, ay = a.y * h, bx = b.x * w, by = b.y * h;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + (bx - ax) * k, ay + (by - ay) * k);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const s of userStars) {
      const age = t - s.born;
      const intro = Math.min(1, age / 500);
      const boom = age < 500 ? 1 + (1 - intro) * 2 : 1;
      const k = 0.8 + 0.2 * Math.sin(t * 0.003 + s.ph);
      const x = s.x * w, y = s.y * h;
      const g = 26 * boom;
      ctx.globalAlpha = intro;
      ctx.drawImage(SPR.glowPink, x - g, y - g, g * 2, g * 2);
      ctx.fillStyle = s.color;
      starPath(ctx, x, y, 11 * k * boom);
      ctx.fill();
    }
    ctx.restore();
  }

  function addStar(x, y) {
    userStars.push({
      x: x / w, y: y / h, born: performance.now(), ph: Math.random() * 6.28,
      color: ["#fff1c9", "#ffd1e3", "#d9ccff", "#ffe2a6"][userStars.length % 4],
    });
    return userStars.length;
  }

  /* ---------- estrellas fugaces ---------- */
  function spawnShooting() {
    const fromLeft = Math.random() < 0.5;
    const speed = rand(9, 14);
    const ang = rand(0.25, 0.55);
    shooting.push({
      x: fromLeft ? rand(-50, w * 0.4) : rand(w * 0.6, w + 50),
      y: rand(-20, h * 0.35),
      vx: (fromLeft ? 1 : -1) * Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: 1,
    });
  }
  function drawShooting() {
    if (!shooting.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    for (let i = shooting.length - 1; i >= 0; i--) {
      const s = shooting[i];
      s.x += s.vx; s.y += s.vy; s.life -= 0.012;
      if (s.life <= 0) { shooting.splice(i, 1); continue; }
      const tx = s.x - s.vx * 9, ty = s.y - s.vy * 9;
      const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, `rgba(255,255,255,${s.life})`);
      g.addColorStop(1, "rgba(255,200,230,0)");
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- bucle ---------- */
  function loop(t) {
    if (!running) return;
    const dt = last ? Math.min(50, t - last) : 16;
    last = t;
    rot += (0.00018 + vel) * (dt / 16);
    vel *= Math.pow(0.95, dt / 16);
    if (!reveal && t > nextShoot && !reducedMotion) {
      spawnShooting();
      nextShoot = t + rand(3500, 7500);
    }
    drawFrame(t);

    // si el celular sufre, bajamos la resolución una vez
    if (!reveal && !perf.checked && !document.hidden) {
      perf.n++;
      perf.sum += dt;
      if (perf.n === 90) {
        perf.checked = true;
        if (perf.sum / perf.n > 24 && dprCap > 1) {
          dprCap = 1;
          build();
        }
      }
    }
    requestAnimationFrame(loop);
  }

  /* ---------- interacción ---------- */
  let down = null;
  canvas.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY, lx: e.clientX, t: performance.now() };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - down.lx;
    down.lx = e.clientX;
    vel += dx * 0.00012 * (e.clientY < cy ? 1 : -1);
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    const quick = performance.now() - down.t < 450;
    down = null;
    if (moved < 10 && quick) canvas.dispatchEvent(new CustomEvent("tapstar", { detail: { x: e.clientX, y: e.clientY } }));
  });
  canvas.addEventListener("pointercancel", () => (down = null));

  let resizeTimer;
  window.addEventListener("resize", () => {
    if (reveal) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      if (!running) drawFrame(performance.now());
    }, 150);
  });

  return {
    canvas,
    build,
    get center() { return { x: cx, y: cy, R }; },
    get size() { return { w, h }; },
    snapshot(px = 360) {
      drawFrame(performance.now());
      const out = document.createElement("canvas");
      out.width = out.height = px;
      out.getContext("2d").drawImage(canvas, (cx - R) * dpr, (cy - R) * dpr, 2 * R * dpr, 2 * R * dpr, 0, 0, px, px);
      return out.toDataURL("image/jpeg", 0.9);
    },
    setReveal(r) { reveal = r; },
    start() {
      if (running) return;
      running = true;
      last = 0;
      nextShoot = performance.now() + 2500;
      perf.n = perf.sum = 0;
      requestAnimationFrame(loop);
    },
    stop() { running = false; },
    addStar,
    clearStars() { userStars = []; shooting = []; },
    shoot: spawnShooting,
  };
})();

/* =========================================================
   El zoom por escalas: imagen 1 → imagen 2 → imagen 3 → galaxia
   Cada imagen se ancla en el espacio entre los deditos y se funde
   con la siguiente mientras la cámara sigue acercándose.
   rel = cuántos px de la imagen 1 mide 1 px de esta imagen
   ========================================================= */
const Zoom = (() => {
  const canvas = $("#zoom");
  const ctx = canvas.getContext("2d");
  const IMGS = [
    { src: "img/erizo-1.webp", dot: [109, 512], rel: 1, bg: [253, 253, 253] },
    { src: "img/erizo-2.webp", dot: [161, 639], rel: 0.21, bg: [245, 218, 188], feather: 0.08 },
    { src: "img/erizo-3.webp", dot: [313, 695], rel: 0.0714, bg: [243, 230, 214], feather: 0.1, dotR: 70 },
  ];
  let w = 0, h = 0, dpr = 1;

  // bordes difuminados para que cada imagen se funda con la anterior
  function feathered(img, f) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = "destination-in";
    const fx = c.width * f, fy = c.height * f;
    let g = x.createLinearGradient(0, 0, c.width, 0);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(fx / c.width, "#000");
    g.addColorStop(1 - fx / c.width, "#000");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, c.width, c.height);
    g = x.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(fy / c.height, "#000");
    g.addColorStop(1 - fy / c.height, "#000");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  async function load() {
    await Promise.all(IMGS.map(async (o) => {
      const img = new Image();
      img.src = o.src;
      await img.decode();
      o.w = img.naturalWidth;
      o.h = img.naturalHeight;
      o.draw = o.feather ? feathered(img, o.feather) : img;
    }));
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }

  // transición suave en escala logarítmica
  const ss = (a, b, m) => {
    const t = clamp01((Math.log(m) - Math.log(a)) / (Math.log(b) - Math.log(a)));
    return t * t * (3 - 2 * t);
  };
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

  // m1 = px de pantalla por px de la imagen 1; p = dónde está el "poquito" en pantalla
  function draw(m1, p) {
    const a = [
      1 - ss(2.2, 3.0, m1),
      ss(1.45, 2.2, m1) * (1 - ss(5.6, 7.2, m1)),
      ss(3.6, 5.6, m1),
    ];
    const bg = mix(mix(IMGS[0].bg, IMGS[1].bg, 1 - a[0]), IMGS[2].bg, a[2]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgb(${bg})`;
    ctx.fillRect(0, 0, w, h);
    IMGS.forEach((o, i) => {
      if (a[i] < 0.002) return;
      const m = m1 * o.rel;
      const x = p.x - o.dot[0] * m;
      const y = p.y - o.dot[1] * m;
      const W = o.w * m, H = o.h * m;
      if (x > w || y > h || x + W < 0 || y + H < 0) return;
      ctx.globalAlpha = a[i];
      ctx.drawImage(o.draw, x, y, W, H);
    });
  }

  return {
    load,
    IMGS,
    show() { size(); canvas.classList.add("on"); },
    hide() { canvas.classList.remove("on"); canvas.style.opacity = ""; },
    draw,
    canvas,
    dot3(m1) { return IMGS[2].dotR * IMGS[2].rel * m1; },
  };
})();

/* =========================================================
   Preparar
   ========================================================= */
let state = "loading"; // loading → hog → zooming → space

async function init() {
  Sky.build();
  try {
    await Promise.all([Zoom.load(), els.erizo.decode()]);
  } catch (e) { /* si falla una imagen igual mostramos lo que haya */ }
  els.hog.classList.add("ready");
  state = "hog";
  if (pendingZoom) zoomIn();
}
let pendingZoom = false;
init();

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
   La transición completa (un solo movimiento continuo)
   ========================================================= */
async function zoomIn() {
  if (state === "loading") { pendingZoom = true; return; }
  if (state !== "hog") return;
  state = "zooming";
  els.stage.classList.add("zooming");
  if (navigator.vibrate) navigator.vibrate(15);
  await new Promise(requestAnimationFrame);

  // dónde está el "poquito" ahora mismo en la pantalla
  const r = els.erizo.getBoundingClientRect();
  const m0 = r.width / Zoom.IMGS[0].w;
  const d = Zoom.IMGS[0].dot;
  const p0 = { x: r.left + d[0] * m0, y: r.top + d[1] * m0 };

  Zoom.show();
  Zoom.draw(m0, p0);
  els.hog.style.visibility = "hidden";

  const { x: gx, y: gy, R } = Sky.center;
  const { w, h } = Sky.size;
  const far = Math.hypot(Math.max(gx, w - gx), Math.max(gy, h - gy)) / 0.84;
  const M_REVEAL = 6.3;   // aquí el puntito ya es una galaxia de buen tamaño
  const M_END = 19;
  const T = reducedMotion ? 1600 : 6200;
  const L0 = Math.log(m0), L1 = Math.log(M_END);
  const u = els.universe;

  Sound.whoosh((T / 1000) * 0.62);
  let kReveal = null;

  await new Promise((done) => {
    const t0 = performance.now();
    const step = (now) => {
      const k = clamp01((now - t0) / T);
      const m1 = Math.exp(L0 + (L1 - L0) * easeInOutSine(k));
      const travel = easeInOutCubic(clamp01(k / 0.6));
      const p = { x: p0.x + (gx - p0.x) * travel, y: p0.y + (gy - p0.y) * travel };
      Zoom.draw(m1, p);

      if (kReveal === null && m1 >= M_REVEAL) {
        kReveal = k;
        Sky.setReveal({ x: p.x, y: p.y, rad: Zoom.dot3(m1), z: Zoom.dot3(m1) / R, ring: 0 });
        u.style.opacity = "0";
        u.classList.add("on", "revealing");
        u.setAttribute("aria-hidden", "false");
        Sky.start();
        Sound.pad();
      }
      if (kReveal !== null) {
        const kr = clamp01((k - kReveal) / (1 - kReveal));
        const rad = Math.max(Zoom.dot3(m1), far * easeInCubic(kr));
        Sky.setReveal({ x: p.x, y: p.y, rad, z: Math.min(1, rad / R), ring: Math.sin(Math.PI * kr) });
        u.style.opacity = String(clamp01(kr / 0.15));
        Zoom.canvas.style.opacity = String(1 - easeInOutSine(clamp01((kr - 0.55) / 0.4)));
      }
      if (k < 1) requestAnimationFrame(step);
      else done();
    };
    requestAnimationFrame(step);
  });

  Sky.setReveal(null);
  u.style.opacity = "";
  u.classList.remove("revealing");
  Zoom.hide();
  els.scene.classList.add("gone");
  document.body.classList.add("in-space");
  state = "space";
  await runText();
}

async function runText() {
  const fast = reducedMotion;
  await sleep(fast ? 100 : 200);
  els.l1.classList.add("show");
  await sleep(fast ? 1500 : 3200);
  if (state !== "space") return;
  els.l1.classList.remove("show");
  await sleep(fast ? 200 : 900);
  els.l2.classList.add("show");
  await sleep(fast ? 1300 : 2600);
  if (state !== "space") return;
  els.l2.classList.remove("show");
  await sleep(fast ? 200 : 900);
  els.l3.classList.add("show");
  Sky.shoot();
  Sound.twinkle();
  await sleep(fast ? 400 : 1800);
  if (state !== "space") return;
  els.hint.classList.add("show");
  els.actions.classList.add("show");
}

els.hogBtn.addEventListener("click", zoomIn);
els.zoomBtn.addEventListener("click", zoomIn);

/* =========================================================
   Tocar el cielo → estrellas con mensajito
   ========================================================= */
let pool = [];
let named = false;
Sky.canvas.addEventListener("tapstar", (e) => {
  if (state !== "space") return;
  const n = Sky.addStar(e.detail.x, e.detail.y);
  Sound.twinkle();
  if (navigator.vibrate) navigator.vibrate(8);

  els.hint.classList.remove("show");
  els.count.hidden = false;
  els.countNum.textContent = n;
  els.countLbl.textContent = n === 1 ? "estrella" : "estrellas";

  if (n === CONFIG.constelacion && !named) {
    named = true;
    toast(`¡Mira! Hiciste una constelación. Desde hoy se llama «${CONFIG.para}» ✨`, 4600);
    return;
  }
  if (!pool.length) pool = [...CONFIG.estrellas].sort(() => Math.random() - 0.5);
  toast(pool.pop());
});

/* =========================================================
   La carta
   ========================================================= */
function openLetter() {
  $("#letterTitle").textContent = `${CONFIG.para}:`;
  const body = $("#letterBody");
  body.innerHTML = "";
  CONFIG.carta.forEach((line, i) => {
    const p = document.createElement("p");
    p.style.animationDelay = `${0.25 + i * 0.35}s`;
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
  $("#letterSign").textContent = `— ${CONFIG.de} 🦔`;
  els.letter.hidden = false;
  Sound.twinkle();
  els.letterClose.focus({ preventScroll: true });
}
function closeLetter() {
  els.letter.hidden = true;
  els.letterBtn.focus({ preventScroll: true });
}
els.letterBtn.addEventListener("click", openLetter);
els.letterClose.addEventListener("click", closeLetter);
els.letter.addEventListener("click", (e) => { if (e.target === els.letter) closeLetter(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !els.letter.hidden) closeLetter(); });

/* =========================================================
   Volver al erizo
   ========================================================= */
els.replayBtn.addEventListener("click", async () => {
  if (state !== "space") return;
  state = "leaving";
  const u = els.universe;
  [els.l1, els.l2, els.l3, els.hint, els.actions].forEach((el) => el.classList.remove("show"));

  // el erizo regresa detrás, ya en su lugar
  els.stage.classList.remove("zooming");
  els.hog.style.visibility = "";
  els.hog.classList.remove("ready");
  els.scene.classList.remove("gone");
  document.body.classList.remove("in-space");

  u.style.transition = "opacity .7s ease";
  u.style.opacity = "0";
  await sleep(250);
  els.hog.classList.add("ready");
  await sleep(500);

  Sky.stop();
  Sky.clearStars();
  named = false;
  u.classList.remove("on");
  u.setAttribute("aria-hidden", "true");
  u.style.transition = "";
  u.style.opacity = "";
  els.count.hidden = true;
  state = "hog";
});
