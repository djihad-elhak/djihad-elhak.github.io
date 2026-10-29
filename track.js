// Hero background: a simulated detection-and-tracking overlay on a microscope field.
// Cells swim on smooth random paths; each carries a detection box, a track id and its recent trajectory,
// the way a YOLO + DeepSORT pipeline draws them. Decorative only (the canvas is aria-hidden).
(() => {
  const canvas = document.getElementById("field");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const css = getComputedStyle(document.documentElement);
  const BOX = css.getPropertyValue("--box").trim() || "#f3b53f";
  const TRACK = css.getPropertyValue("--track").trim() || "#6fd3c6";
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0, h = 0, dpr = 1, cells = [], nextId = 1, running = false, raf = 0, last = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  function spawn(atEdge) {
    const c = {
      id: nextId++,
      x: rand(0, w), y: rand(0, h),
      a: rand(0, Math.PI * 2),       // heading
      turn: rand(-0.6, 0.6),         // slow drift of the heading
      v: rand(14, 42),               // px per second: some cells are fast, some barely move
      phase: rand(0, Math.PI * 2),
      size: rand(5, 7.5),
      conf: rand(0.82, 0.98),
      trail: [],
      age: 0,
    };
    if (atEdge) {
      const side = Math.floor(rand(0, 4));
      if (side === 0) { c.x = -20; c.a = rand(-0.6, 0.6); }
      if (side === 1) { c.x = w + 20; c.a = Math.PI + rand(-0.6, 0.6); }
      if (side === 2) { c.y = -20; c.a = Math.PI / 2 + rand(-0.6, 0.6); }
      if (side === 3) { c.y = h + 20; c.a = -Math.PI / 2 + rand(-0.6, 0.6); }
    }
    return c;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(26, Math.max(9, (w * h) / 52000)));
    while (cells.length < n) cells.push(spawn(false));
    cells.length = n;
  }

  function step(dt) {
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      c.age += dt;
      c.turn += rand(-0.9, 0.9) * dt;
      c.turn = Math.max(-0.9, Math.min(0.9, c.turn));
      c.a += c.turn * dt;
      c.phase += dt * 9;
      c.x += Math.cos(c.a) * c.v * dt;
      c.y += Math.sin(c.a) * c.v * dt;
      c.trail.push(c.x, c.y);
      if (c.trail.length > 360) c.trail.splice(0, 2);
      if (c.x < -60 || c.x > w + 60 || c.y < -60 || c.y > h + 60) cells[i] = spawn(true); // track lost, new id
    }
  }

  function grid() {
    // counting-chamber grid, barely visible
    ctx.lineWidth = 1;
    const big = 160, small = big / 4;
    ctx.strokeStyle = "rgba(163, 184, 190, 0.05)";
    ctx.beginPath();
    for (let x = 0; x < w; x += small) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = 0; y < h; y += small) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();
    ctx.strokeStyle = "rgba(163, 184, 190, 0.10)";
    ctx.beginPath();
    for (let x = 0; x < w; x += big) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = 0; y < h; y += big) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();
  }

  function corners(x, y, bw, bh, k) {
    ctx.beginPath();
    ctx.moveTo(x, y + k); ctx.lineTo(x, y); ctx.lineTo(x + k, y);
    ctx.moveTo(x + bw - k, y); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw, y + k);
    ctx.moveTo(x + bw, y + bh - k); ctx.lineTo(x + bw, y + bh); ctx.lineTo(x + bw - k, y + bh);
    ctx.moveTo(x + k, y + bh); ctx.lineTo(x, y + bh); ctx.lineTo(x, y + bh - k);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    grid();
    ctx.font = '600 11px "Chakra Petch", sans-serif';
    for (const c of cells) {
      // trajectory
      const t = c.trail;
      if (t.length > 4) {
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = TRACK;
        for (let i = 2; i < t.length; i += 2) {
          ctx.globalAlpha = 0.15 + 0.7 * (i / t.length);
          ctx.beginPath(); ctx.moveTo(t[i - 2], t[i - 1]); ctx.lineTo(t[i], t[i + 1]); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      // cell: head with a beating tail
      const ca = Math.cos(c.a), sa = Math.sin(c.a);
      ctx.strokeStyle = "rgba(214, 228, 232, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let s = 0; s <= 14; s++) {
        const d = c.size + s * 1.9, wob = Math.sin(c.phase - s * 0.55) * (s * 0.32);
        const px = c.x - ca * d - sa * wob, py = c.y - sa * d + ca * wob;
        s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(230, 238, 240, 0.85)";
      ctx.beginPath(); ctx.ellipse(c.x, c.y, c.size, c.size * 0.66, c.a, 0, Math.PI * 2); ctx.fill();
      // detection box and track label
      const bw = 34, bh = 30, bx = c.x - bw / 2, by = c.y - bh / 2;
      ctx.strokeStyle = BOX; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.9;
      corners(bx, by, bw, bh, 7);
      ctx.fillStyle = BOX;
      ctx.fillText(`id ${c.id}  ${c.conf.toFixed(2)}`, bx, by - 5);
      ctx.globalAlpha = 1;
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    step(dt); draw();
    if (running) raf = requestAnimationFrame(frame);
  }
  function start() { if (running || still) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  for (let i = 0; i < 180; i++) step(1 / 30); // give every cell a trajectory before the first frame
  draw();
  window.addEventListener("resize", () => { resize(); draw(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  if (still) return;
  const io = new IntersectionObserver((e) => (e[0].isIntersecting ? start() : stop()));
  io.observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
})();
