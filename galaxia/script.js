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

const els = {
  scene: $("#scene"),
  stage: $("#stage"),
  hogBtn: $("#hogBtn"),
  zoomBtn: $("#zoomBtn"),
  dot: $("#dot"),
  dotImg: $("#dotImg"),
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
   Púas del erizo con trazos de crayón
   ========================================================= */
(function drawSpikes() {
  const g = $("#spikes");
  const NS = "http://www.w3.org/2000/svg";
  const cx = 168, cy = 196, rx = 112, ry = 120;
  const browns = ["#3f2412", "#5a3519", "#6e4322", "#8a5a30", "#a8743f", "#c08a52"];

  const base = document.createElementNS(NS, "ellipse");
  base.setAttribute("cx", cx + 6);
  base.setAttribute("cy", cy);
  base.setAttribute("rx", rx * 0.86);
  base.setAttribute("ry", ry * 0.86);
  base.setAttribute("fill", "#6a3f1f");
  g.appendChild(base);

  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  for (let pass = 0; pass < 3; pass++) {
    const n = 64 + pass * 14;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const ang = ((-168 + t * 250 + (rnd() - 0.5) * 6) * Math.PI) / 180;
      const lean = ang + 0.28; // las púas se inclinan hacia atrás
      const r0 = 0.5 + pass * 0.12 + rnd() * 0.08;
      const r1 = 0.92 + pass * 0.07 + rnd() * 0.14;
      const x0 = cx + Math.cos(ang) * rx * r0;
      const y0 = cy + Math.sin(ang) * ry * r0;
      const x1 = cx + Math.cos(lean) * rx * r1;
      const y1 = cy + Math.sin(lean) * ry * r1;
      const mx = (x0 + x1) / 2 + Math.cos(lean + 1.57) * 4;
      const my = (y0 + y1) / 2 + Math.sin(lean + 1.57) * 4;
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`);
      p.setAttribute("stroke", browns[Math.floor(rnd() * (pass === 2 ? browns.length : 4))]);
      p.setAttribute("stroke-width", (2.4 + rnd() * 3.4 - pass * 0.5).toFixed(1));
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("fill", "none");
      p.setAttribute("opacity", (0.75 + rnd() * 0.25).toFixed(2));
      g.appendChild(p);
    }
  }
})();

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
   ========================================================= */
const Sky = (() => {
  const canvas = $("#sky");
  const ctx = canvas.getContext("2d");
  const bg = document.createElement("canvas");
  const bgx = bg.getContext("2d");

  let w = 0, h = 0, dpr = 1, cx = 0, cy = 0, R = 0;
  let buckets = [];
  let clouds = [];
  let zoom = 1;
  const sprites = ["255,200,170", "255,110,170", "150,110,255", "90,120,255"].map((rgb) => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(0.4, `rgba(${rgb},.35)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return c;
  });
  let twinklers = [];
  let sparkles = [];
  let shooting = [];
  let userStars = [];
  let rot = 0, vel = 0, frame = 0, running = false, last = 0;
  const TILT = 0.6;
  const PHI = -0.42;
  const cosP = Math.cos(PHI), sinP = Math.sin(PHI);

  const PALETTE = {
    core: ["#fff6e0", "#ffe2b0", "#ffd08a"],
    mid: ["#ffc2a8", "#ff9fb8", "#f58fc8"],
    outer: ["#a58af5", "#7f86f0", "#c49cf7", "#6bb6ff"],
    clump: ["#ff6fa8", "#ff8fd0"],
  };

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = bg.width = Math.round(w * dpr);
    canvas.height = bg.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2;
    cy = h * (w < 700 ? 0.53 : 0.52);
    R = Math.min(w, h) * (w < 700 ? 0.46 : 0.4);
  }

  function build() {
    size();
    const N = w * h < 600000 ? 6000 : 9500;
    const map = new Map();
    const push = (color, p) => {
      if (!map.has(color)) map.set(color, []);
      map.get(color).push(p);
    };
    for (let i = 0; i < N; i++) {
      const kind = Math.random();
      const halo = kind < 0.14;
      const core = !halo && kind < 0.36;
      const r = halo ? Math.pow(Math.random(), 0.6) * 1.08 : core ? Math.pow(Math.random(), 2.2) * 0.32 : 0.06 + Math.pow(Math.random(), 0.85) * 0.96;
      const arm = Math.random() < 0.5 ? 0 : Math.PI;
      const th = halo || core ? Math.random() * Math.PI * 2 : arm + r * 4.4 + gauss() * (0.38 + 0.25 * (1 - r));
      const rr = Math.max(0.005, r + gauss() * (halo || core ? 0.02 : 0.055));
      let color;
      const k = Math.random();
      if (rr < 0.16) color = PALETTE.core[Math.floor(k * 3)];
      else if (rr < 0.42) color = k < 0.1 ? PALETTE.clump[Math.floor(Math.random() * 2)] : PALETTE.mid[Math.floor(Math.random() * 3)];
      else color = k < 0.06 ? PALETTE.clump[Math.floor(Math.random() * 2)] : PALETTE.outer[Math.floor(Math.random() * 4)];
      push(color, {
        r: rr,
        th,
        s: rr < 0.16 ? rand(0.9, 2) : Math.random() < 0.06 ? rand(1.8, 2.6) : rand(0.6, 1.5),
        a: halo ? rand(0.12, 0.4) : rand(0.3, 0.95),
        tw: Math.random() * 6.28,
      });
    }
    buckets = [...map.entries()].map(([color, parts]) => ({ color, parts }));

    // nubes de gas a lo largo de los brazos
    clouds = [];
    const cloudN = w < 700 ? 110 : 160;
    for (let i = 0; i < cloudN; i++) {
      const r = 0.12 + Math.pow(Math.random(), 0.8) * 0.9;
      const arm = Math.random() < 0.5 ? 0 : Math.PI;
      clouds.push({
        r,
        th: arm + r * 4.4 + gauss() * 0.3,
        s: R * rand(0.07, 0.16) * (1.1 - r * 0.4),
        a: rand(0.18, 0.4),
        sprite: r < 0.3 ? 0 : Math.random() < 0.3 ? 1 : Math.random() < 0.6 ? 2 : 3,
      });
    }
    buildBackground();
  }

  function sparkle(c, x, y, s, color, alpha) {
    c.save();
    c.globalAlpha = alpha;
    c.translate(x, y);
    c.fillStyle = color;
    c.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      c.lineTo(Math.cos(a) * s, Math.sin(a) * s);
      c.lineTo(Math.cos(a + Math.PI / 4) * s * 0.16, Math.sin(a + Math.PI / 4) * s * 0.16);
    }
    c.closePath();
    c.fill();
    const g = c.createRadialGradient(0, 0, 0, 0, 0, s * 0.9);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.globalAlpha = alpha * 0.5;
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, s * 0.9, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  function buildBackground() {
    const c = bgx;
    c.globalCompositeOperation = "source-over";
    c.fillStyle = "#05040f";
    c.fillRect(0, 0, w, h);
    // nebulosas
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
    // estrellitas fijas
    c.globalCompositeOperation = "lighter";
    const n = Math.round((w * h) / 2200);
    for (let i = 0; i < n; i++) {
      c.globalAlpha = rand(0.15, 0.7);
      c.fillStyle = Math.random() < 0.8 ? "#ffffff" : Math.random() < 0.5 ? "#ffd9a8" : "#a9c4ff";
      const s = Math.random() < 0.92 ? rand(0.4, 1) : rand(1, 1.8);
      c.fillRect(rand(0, w), rand(0, h), s, s);
    }
    // galaxias lejanas
    for (let i = 0; i < 6; i++) {
      let x, y;
      do { x = rand(0, w); y = rand(0, h); } while (Math.hypot(x - cx, (y - cy) / 0.8) < R * 1.25);
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
      x: rand(0, w), y: rand(0, h), s: rand(0.8, 1.8), ph: Math.random() * 6.28, sp: rand(0.02, 0.06),
    }));
    sparkles = Array.from({ length: w < 700 ? 9 : 14 }, () => {
      let x, y;
      do { x = rand(0, w); y = rand(0, h); } while (Math.hypot(x - cx, y - cy) < R * 0.5);
      return { x, y, s: rand(5, 11), ph: Math.random() * 6.28, color: Math.random() < 0.7 ? "#ffe2a6" : "#cfe0ff" };
    });
  }

  function project(r, a) {
    const x = Math.cos(a) * r * R;
    const y = Math.sin(a) * r * R * TILT;
    return [cx + x * cosP - y * sinP, cy + x * sinP + y * cosP];
  }

  function drawGalaxy(t) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // halo
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(PHI);
    ctx.scale(1, TILT);
    let g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.15);
    g.addColorStop(0, "rgba(190,130,255,.32)");
    g.addColorStop(0.45, "rgba(120,80,220,.14)");
    g.addColorStop(0.8, "rgba(80,60,200,.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // nubes
    for (const c of clouds) {
      const a = c.th + rot * (1 + 0.5 * (1 - c.r));
      const x0 = Math.cos(a) * c.r * R;
      const y0 = Math.sin(a) * c.r * R * TILT;
      const x = cx + x0 * cosP - y0 * sinP;
      const y = cy + x0 * sinP + y0 * cosP;
      ctx.globalAlpha = c.a;
      ctx.drawImage(sprites[c.sprite], x - c.s, y - c.s, c.s * 2, c.s * 2);
    }

    // estrellas de la galaxia
    for (const b of buckets) {
      ctx.fillStyle = b.color;
      for (const p of b.parts) {
        const a = p.th + rot * (1 + 0.5 * (1 - p.r));
        const x0 = Math.cos(a) * p.r * R;
        const y0 = Math.sin(a) * p.r * R * TILT;
        const x = cx + x0 * cosP - y0 * sinP;
        const y = cy + x0 * sinP + y0 * cosP;
        ctx.globalAlpha = p.a * (0.75 + 0.25 * Math.sin(t * 0.002 + p.tw));
        ctx.fillRect(x, y, p.s, p.s);
      }
    }

    // núcleo brillante
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(PHI);
    ctx.scale(1, TILT * 1.1);
    const pulse = 1 + 0.03 * Math.sin(t * 0.0015);
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.36 * pulse);
    g.addColorStop(0, "rgba(255,250,235,1)");
    g.addColorStop(0.15, "rgba(255,226,180,.8)");
    g.addColorStop(0.45, "rgba(255,150,150,.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.36 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  function drawFrame(t) {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#05040f";
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    if (zoom !== 1) {
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);
    }
    ctx.drawImage(bg, 0, 0, w, h);

    // titileo
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "#fff";
    for (const s of twinklers) {
      s.ph += s.sp;
      ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(s.ph));
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    for (const s of sparkles) {
      const k = 0.6 + 0.4 * Math.sin(t * 0.0018 + s.ph);
      sparkle(ctx, s.x, s.y, s.s * k, s.color, 0.85 * k);
    }

    drawGalaxy(t);
    ctx.restore();
    drawUserStars(t);
    drawShooting();
  }

  /* ----- estrellas que pone ella ----- */
  function drawUserStars(t) {
    if (!userStars.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    // líneas de la constelación
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";
    for (let i = 1; i < userStars.length; i++) {
      const a = userStars[i - 1], b = userStars[i];
      const k = Math.min(1, (t - b.born) / 900);
      if (k <= 0) continue;
      const ax = a.x * w, ay = a.y * h, bx = b.x * w, by = b.y * h;
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = "#ffd6e6";
      ctx.setLineDash([3, 5]);
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
      const halo = ctx.createRadialGradient(x, y, 0, x, y, 26 * boom);
      halo.addColorStop(0, "rgba(255,214,230,.55)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = intro;
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, 26 * boom, 0, Math.PI * 2);
      ctx.fill();
      sparkle(ctx, x, y, 11 * k * boom, s.color, intro);
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

  /* ----- estrellas fugaces ----- */
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
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = shooting.length - 1; i >= 0; i--) {
      const s = shooting[i];
      s.x += s.vx; s.y += s.vy; s.life -= 0.012;
      if (s.life <= 0) { shooting.splice(i, 1); continue; }
      const tx = s.x - s.vx * 9, ty = s.y - s.vy * 9;
      const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, `rgba(255,255,255,${s.life})`);
      g.addColorStop(1, "rgba(255,200,230,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ----- bucle ----- */
  let nextShoot = 0;
  function loop(t) {
    if (!running) return;
    const dt = last ? Math.min(50, t - last) : 16;
    last = t;
    rot += (0.00018 + vel) * (dt / 16);
    vel *= 0.95;
    if (t > nextShoot && !reducedMotion) {
      spawnShooting();
      nextShoot = t + rand(3500, 7500);
    }
    drawFrame(t);
    frame++;
    requestAnimationFrame(loop);
  }

  /* ----- interacción: arrastrar = girar, tocar = estrella ----- */
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
  const up = (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    const quick = performance.now() - down.t < 450;
    down = null;
    if (moved < 10 && quick) canvas.dispatchEvent(new CustomEvent("tapstar", { detail: { x: e.clientX, y: e.clientY } }));
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", () => (down = null));

  let resizeTimer;
  window.addEventListener("resize", () => {
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
    snapshot(px = 360) {
      // dibuja un cuadro y recorta la galaxia para meterla entre los deditos
      drawFrame(performance.now());
      const out = document.createElement("canvas");
      out.width = out.height = px;
      const o = out.getContext("2d");
      o.drawImage(canvas, (cx - R) * dpr, (cy - R) * dpr, 2 * R * dpr, 2 * R * dpr, 0, 0, px, px);
      return out.toDataURL("image/jpeg", 0.9);
    },
    start() { if (!running) { running = true; last = 0; nextShoot = performance.now() + 2500; requestAnimationFrame(loop); } },
    stop() { running = false; },
    addStar,
    // la galaxia crece desde el punto (radio dotR) hasta llenar la pantalla
    reveal(el, dotR, ms) {
      return new Promise((res) => {
        const t0 = performance.now();
        const full = Math.hypot(w, h);
        const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
        const step = (t) => {
          const k = Math.min(1, (t - t0) / ms);
          const e = ease(k);
          zoom = dotR / R + (1 - dotR / R) * e;
          const rad = dotR + (full - dotR) * Math.pow(e, 1.6);
          el.style.clipPath = `circle(${rad.toFixed(1)}px at ${cx}px ${cy}px)`;
          if (k < 1) requestAnimationFrame(step);
          else { zoom = 1; el.style.clipPath = "none"; res(); }
        };
        requestAnimationFrame(step);
      });
    },
    clearStars() { userStars = []; },
    shoot: spawnShooting,
  };
})();

/* =========================================================
   Preparar la galaxia diminuta entre los dedos
   ========================================================= */
function prepareDot() {
  Sky.build();
  els.dotImg.setAttribute("href", Sky.snapshot());
}
prepareDot();
let dotTimer;
window.addEventListener("resize", () => {
  if (state !== "hog") return;
  clearTimeout(dotTimer);
  dotTimer = setTimeout(prepareDot, 250);
});

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
   El zoom: del "poquito" al universo
   ========================================================= */
let state = "hog"; // hog → zooming → space
const transitionEnd = (el, prop, fallback) =>
  new Promise((res) => {
    const done = (e) => {
      if (e && e.target !== el) return;
      if (e && prop && e.propertyName !== prop) return;
      el.removeEventListener("transitionend", done);
      clearTimeout(tm);
      res();
    };
    const tm = setTimeout(done, fallback);
    el.addEventListener("transitionend", done);
  });

async function zoomIn() {
  if (state !== "hog") return;
  state = "zooming";
  Sound.whoosh(reducedMotion ? 0.6 : 2.3);
  if (navigator.vibrate) navigator.vibrate(20);

  // 1) acercarnos al espacio entre los deditos
  const r0 = els.dot.getBoundingClientRect();
  const px = r0.left + r0.width / 2;
  const py = r0.top + r0.height / 2;
  const { x: gx, y: gy, R } = Sky.center;
  const targetR = Math.min(innerWidth, innerHeight) * 0.11;
  const s = targetR / (r0.width / 2);

  els.stage.style.transformOrigin = `${px}px ${py}px`;
  els.stage.classList.add("zooming");
  if (reducedMotion) els.stage.style.transition = "transform .5s ease";
  requestAnimationFrame(() => {
    els.stage.style.transform = `translate(${gx - px}px, ${gy - py}px) scale(${s})`;
  });
  await transitionEnd(els.stage, "transform", reducedMotion ? 700 : 2600);

  // 2) la galaxia sale del punto y llena la pantalla
  const r1 = els.dot.getBoundingClientRect();
  const dotR = r1.width / 2;
  const u = els.universe;
  u.style.transition = "none";
  u.style.clipPath = `circle(${dotR}px at ${gx}px ${gy}px)`;
  u.classList.add("on");
  u.setAttribute("aria-hidden", "false");
  Sky.start();
  Sound.pad();
  await Sky.reveal(u, dotR, reducedMotion ? 500 : 2200);
  els.scene.classList.add("gone");
  document.body.classList.add("in-space");
  state = "space";

  // 3) los mensajes
  await runText();
}

async function runText() {
  const fast = reducedMotion;
  await sleep(fast ? 100 : 300);
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
  state = "hog";
  const u = els.universe;
  u.style.transition = "opacity .6s ease";
  u.style.opacity = "0";
  els.scene.classList.remove("gone");
  document.body.classList.remove("in-space");

  // el erizo vuelve sin animación de zoom
  els.stage.classList.remove("zooming");
  els.stage.style.transition = "none";
  els.stage.style.transform = "none";
  void els.stage.offsetWidth;
  els.stage.style.transition = "";

  await sleep(650);
  Sky.stop();
  Sky.clearStars();
  named = false;
  u.classList.remove("on");
  u.setAttribute("aria-hidden", "true");
  u.style.transition = "none";
  u.style.opacity = "";
  u.style.clipPath = "";
  [els.l1, els.l2, els.l3, els.hint, els.actions].forEach((el) => el.classList.remove("show"));
  els.count.hidden = true;
  prepareDot();
});
