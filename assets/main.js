/* Faceted "cut stone" hero: a triangle mesh lit by a light that follows the pointer.
   One memorable moment; stays still when the visitor prefers reduced motion. */
(() => {
  const canvas = document.getElementById("facets");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, tris = [], light = { x: 0.7, y: 0.2 }, target = { x: 0.7, y: 0.2 }, raf = 0;

  // deterministic random so the pattern is the same on every visit
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed = 7;
    const cell = Math.max(70, Math.min(120, W / 12));
    const cols = Math.ceil(W / cell) + 2, rows = Math.ceil(H / cell) + 2;
    const pts = [];
    for (let r = 0; r < rows; r++) {
      pts.push([]);
      for (let c = 0; c < cols; c++) {
        const edge = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
        const j = edge ? 0 : 0.42;
        pts[r].push({ x: (c - 0.5 + (rnd() - 0.5) * j) * cell, y: (r - 0.5 + (rnd() - 0.5) * j) * cell });
      }
    }
    tris = [];
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = pts[r][c], b = pts[r][c + 1], d = pts[r + 1][c], e = pts[r + 1][c + 1];
        const flip = rnd() > 0.5;
        const pair = flip ? [[a, b, e], [a, e, d]] : [[a, b, d], [b, e, d]];
        for (const t of pair) {
          // a fake surface normal per facet, tilted at random like a cut stone
          const nx = rnd() * 2 - 1, ny = rnd() * 2 - 1;
          tris.push({ p: t, nx, ny, glint: rnd() > 0.985 });
        }
      }
    }
  }

  function draw() {
    light.x += (target.x - light.x) * 0.06;
    light.y += (target.y - light.y) * 0.06;
    ctx.clearRect(0, 0, W, H);
    const lx = light.x * W, ly = light.y * H;
    for (const t of tris) {
      const cx = (t.p[0].x + t.p[1].x + t.p[2].x) / 3;
      const cy = (t.p[0].y + t.p[1].y + t.p[2].y) / 3;
      const dx = (lx - cx) / W, dy = (ly - cy) / H;
      const dist = Math.hypot(dx, dy);
      const facing = (t.nx * dx + t.ny * dy) / (dist + 0.001);
      const glow = Math.max(0, 1 - dist * 1.6);
      let l = 15 + 7 * facing * glow + 10 * glow;           // lightness of the facet
      // fade facets under the text (bottom-left) so the copy stays readable
      const shade = Math.min(1, (cy / H) * 0.9 + (1 - cx / W) * 0.35);
      l -= shade * 7;
      ctx.beginPath();
      ctx.moveTo(t.p[0].x, t.p[0].y); ctx.lineTo(t.p[1].x, t.p[1].y); ctx.lineTo(t.p[2].x, t.p[2].y); ctx.closePath();
      if (t.glint && glow > 0.35) {
        ctx.fillStyle = `hsla(38, 88%, ${50 + 10 * glow}%, ${0.35 + 0.5 * glow})`;
      } else {
        ctx.fillStyle = `hsl(172, ${34 + 10 * glow}%, ${Math.max(9, l)}%)`;
      }
      ctx.fill();
      ctx.strokeStyle = `hsla(170, 30%, 40%, ${0.10 + 0.18 * glow})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (!still && (Math.abs(target.x - light.x) > 0.001 || Math.abs(target.y - light.y) > 0.001)) {
      raf = requestAnimationFrame(draw);
    } else {
      raf = 0;
    }
  }

  function kick() { if (!raf) raf = requestAnimationFrame(draw); }

  const hero = canvas.parentElement;
  if (!still) {
    hero.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      target = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
      kick();
    });
    hero.addEventListener("pointerleave", () => { target = { x: 0.7, y: 0.2 }; kick(); });
  }
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); draw(); }, 120); });
  build();
  draw();
})();
