/* =========================================================
   El erizo 🦔
   Se dibuja en SVG con textura de crayón y se "hornea" una sola vez
   a imágenes (capas). Así se ve igual de bonito pero el navegador
   no recalcula los filtros en cada cuadro → animación fluida.
   ========================================================= */
const Hog = (() => {
  const OUT = "#3b2414";
  const SKIN = "#f5d7aa";
  const W = 320, H = 340;

  // azar con semilla: el erizo sale siempre igual
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const f = (n) => n.toFixed(1);
  const rad = (d) => (d * Math.PI) / 180;

  const DEFS = `<defs>
    <filter id="cr" filterUnits="userSpaceOnUse" x="-40" y="-40" width="400" height="420" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves="2" seed="8" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.62" result="ga"/>
      <feComposite in="d" in2="ga" operator="in"/>
    </filter>
    <filter id="crf" filterUnits="userSpaceOnUse" x="-40" y="-40" width="400" height="420" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="5" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="2" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.7 1.3" result="ga"/>
      <feComposite in="d" in2="ga" operator="in"/>
    </filter>
    <radialGradient id="faceG" cx="42%" cy="38%" r="68%">
      <stop offset="0" stop-color="#fbe7c8"/>
      <stop offset=".6" stop-color="#f4d3a3"/>
      <stop offset="1" stop-color="#e4b985"/>
    </radialGradient>
    <radialGradient id="blushG">
      <stop offset="0" stop-color="#f28b8f" stop-opacity=".8"/>
      <stop offset="1" stop-color="#f28b8f" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

  /* ---------- púas ---------- */
  function spine(cx, cy, rx, ry, angDeg, rb, rt, wBase, color, op) {
    const a = rad(angDeg);
    const lean = a + 0.26;
    const bx = cx + Math.cos(a) * rx * rb;
    const by = cy + Math.sin(a) * ry * rb;
    const tx = cx + Math.cos(lean) * rx * rt;
    const ty = cy + Math.sin(lean) * ry * rt;
    const px = -Math.sin(a) * wBase / 2;
    const py = Math.cos(a) * wBase / 2;
    const mx = (bx + tx) / 2 + Math.cos(lean + 1.57) * 1.5;
    const my = (by + ty) / 2 + Math.sin(lean + 1.57) * 1.5;
    return `<path d="M${f(bx + px)} ${f(by + py)} Q${f(mx + px * 0.5)} ${f(my + py * 0.5)} ${f(tx)} ${f(ty)} Q${f(mx - px * 0.5)} ${f(my - py * 0.5)} ${f(bx - px)} ${f(by - py)}Z" fill="${color}" opacity="${op}"/>`;
  }

  function backSpikes() {
    const cx = 184, cy = 186, rx = 118, ry = 124;
    let s = `<ellipse cx="${cx + 2}" cy="${cy + 4}" rx="${rx * 0.9}" ry="${ry * 0.9}" fill="#5b331a"/>`;
    const layers = [
      { n: 120, c: ["#3f2210", "#4e2a14"], b: [0.55, 0.78], t: [0.98, 1.12], w: [8, 12] },
      { n: 110, c: ["#5f361a", "#6e3f1e"], b: [0.6, 0.82], t: [0.93, 1.05], w: [6, 10] },
      { n: 100, c: ["#835127", "#93602f"], b: [0.66, 0.86], t: [0.88, 1.0], w: [4, 7] },
      { n: 70, c: ["#b07a43", "#c9945d"], b: [0.72, 0.88], t: [0.86, 0.97], w: [2, 3.5] },
    ];
    for (const L of layers) {
      for (let i = 0; i < L.n; i++) {
        const ang = -158 + rnd() * 252;
        s += spine(cx, cy, rx, ry, ang,
          L.b[0] + rnd() * (L.b[1] - L.b[0]),
          L.t[0] + rnd() * (L.t[1] - L.t[0]),
          L.w[0] + rnd() * (L.w[1] - L.w[0]),
          L.c[Math.floor(rnd() * 2)],
          (0.8 + rnd() * 0.2).toFixed(2));
      }
    }
    return s;
  }

  // flequillo: puas cortas que caen sobre el borde de la carita
  function fringe() {
    const cx = 153, cy = 214, rx = 82, ry = 110;
    let s = "";
    for (let i = 0; i < 34; i++) {
      const a = rad(-150 + (i / 33) * 128 + (rnd() - 0.5) * 4);
      const ex = cx + Math.cos(a) * rx;
      const ey = cy + Math.sin(a) * ry;
      const nx = Math.cos(a), ny = Math.sin(a);
      const len = 12 + rnd() * 14;
      const lean = 0.35;
      const tx = ex + (nx * Math.cos(lean) - ny * Math.sin(lean)) * len;
      const ty = ey + (nx * Math.sin(lean) + ny * Math.cos(lean)) * len;
      const bx = ex - nx * 7, by = ey - ny * 7;
      const w = 5 + rnd() * 4;
      const px = -ny * w / 2, py = nx * w / 2;
      const col = ["#4e2a14", "#6e3f1e", "#835127"][Math.floor(rnd() * 3)];
      s += `<path d="M${f(bx + px)} ${f(by + py)} L${f(tx)} ${f(ty)} L${f(bx - px)} ${f(by - py)}Z" fill="${col}"/>`;
    }
    return s;
  }

  const FACE = "M72 206 C64 146 108 102 166 104 C220 106 238 158 234 214 C230 278 200 320 150 320 C102 320 78 270 72 206 Z";

  function bodySVG() {
    return `
      <g filter="url(#cr)">${backSpikes()}</g>
      <g filter="url(#crf)">
        <circle cx="208" cy="118" r="17" fill="#f3d2a6" stroke="${OUT}" stroke-width="3.6"/>
        <circle cx="209" cy="119" r="9" fill="#f0a198"/>
      </g>
      <g filter="url(#crf)">
        <ellipse cx="128" cy="323" rx="22" ry="11" fill="#6f4220"/>
        <ellipse cx="190" cy="323" rx="22" ry="11" fill="#6f4220"/>
      </g>
      <path d="${FACE}" fill="url(#faceG)" filter="url(#crf)"/>
      <g filter="url(#cr)">${fringe()}</g>
      <path d="M74 234 C86 288 114 320 150 320 C196 320 226 286 232 238" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round" filter="url(#cr)"/>
      <ellipse cx="112" cy="202" rx="18" ry="10" fill="url(#blushG)"/>
      <ellipse cx="200" cy="208" rx="18" ry="10" fill="url(#blushG)"/>
      <g filter="url(#cr)">
        <ellipse cx="153" cy="191" rx="11.5" ry="8.5" fill="#2e1a0e"/>
        <path d="M146 203 Q153 209 160 203" fill="none" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M200 254 C214 260 216 278 202 287" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
      </g>
      <ellipse cx="149" cy="187.5" rx="3.6" ry="2.2" fill="#fff" opacity=".55"/>`;
  }

  // brazo con los deditos haciendo "poquito"
  // brazo con los deditos haciendo "poquito": índice y pulgar casi se tocan
  const ARM = {
    arm: "M108 246 L93 208",
    index: "M84 184 C76 170 66 158 59 163",
    thumb: "M82 199 C72 202 60 198 57 186",
    palm: [87, 194],
  };
  function armSVG() {
    const ol = 17, fl = 10.5;
    return `
      <g filter="url(#crf)">
        <g stroke="${OUT}" stroke-linecap="round" fill="none">
          <path d="${ARM.arm}" stroke-width="30"/>
          <path d="${ARM.index}" stroke-width="${ol}"/>
          <path d="${ARM.thumb}" stroke-width="${ol}"/>
        </g>
        <circle cx="${ARM.palm[0]}" cy="${ARM.palm[1]}" r="18" fill="${OUT}"/>
        <g stroke="${SKIN}" stroke-linecap="round" fill="none">
          <path d="${ARM.arm}" stroke-width="23"/>
          <path d="${ARM.index}" stroke-width="${fl}"/>
          <path d="${ARM.thumb}" stroke-width="${fl}"/>
        </g>
        <circle cx="${ARM.palm[0]}" cy="${ARM.palm[1]}" r="14.5" fill="${SKIN}"/>
        <ellipse cx="61" cy="165.5" rx="3.6" ry="2.6" fill="#f0a198" opacity=".85"/>
        <ellipse cx="59.5" cy="183" rx="3.6" ry="2.6" fill="#f0a198" opacity=".85"/>
      </g>`;
  }

  function marksSVG() {
    return `<g filter="url(#crf)" stroke="#ee6b5f" stroke-width="4.4" stroke-linecap="round">
        <path d="M40 150 L46 160"/>
        <path d="M26 174 L39 174"/>
        <path d="M30 198 L41 190"/>
      </g>`;
  }

  /* ---------- hornear SVG → PNG ---------- */
  async function bake(inner, vb, pxW) {
    const [x, y, w, h] = vb;
    const pxH = Math.round((pxW * h) / w);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="${x} ${y} ${w} ${h}">${DEFS}${inner}</svg>`;
    const svgUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      const img = new Image();
      img.src = svgUrl;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = pxW;
      c.height = pxH;
      c.getContext("2d").drawImage(img, 0, 0, pxW, pxH);
      const blob = await new Promise((r) => c.toBlob(r, "image/png"));
      if (!blob) throw new Error("toBlob");
      URL.revokeObjectURL(svgUrl);
      return URL.createObjectURL(blob);
    } catch (e) {
      return svgUrl; // si el navegador no deja hornear, usa el SVG directo
    }
  }

  const LAYERS = {
    body: { vb: [0, 0, W, H], svg: bodySVG, scale: 2.6 },
    arm: { vb: [34, 140, 100, 132], svg: armSVG, scale: 7 },
    marks: { vb: [14, 140, 40, 70], svg: marksSVG, scale: 5 },
  };

  function place(img, vb) {
    const [x, y, w, h] = vb;
    Object.assign(img.style, {
      left: (x / W) * 100 + "%",
      top: (y / H) * 100 + "%",
      width: (w / W) * 100 + "%",
      height: (h / H) * 100 + "%",
    });
  }

  async function render(imgs, cssWidth) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const base = Math.max(cssWidth, 320) * dpr;
    await Promise.all(Object.entries(LAYERS).map(async ([k, L]) => {
      const pxW = Math.min(2400, Math.round(base * (L.vb[2] / W) * L.scale));
      seed = 11; // mismas púas siempre
      const url = await bake(L.svg(), L.vb, pxW);
      place(imgs[k], L.vb);
      imgs[k].src = url;
      await imgs[k].decode().catch(() => {});
    }));
  }

  return { render, W, H, DOT: { x: 58, y: 174.5, r: 3 } };
})();
