/* ================================================================== *
 *  CONFETTI — tiny dependency-free canvas burst.
 *  fireConfetti() overlays a full-screen canvas, animates one burst,
 *  then removes itself. Safe to call repeatedly.
 * ================================================================== */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vrot: number;
  shape: 0 | 1;
}

const PALETTE = ["#ffb454", "#ff7a59", "#6aa6ff", "#8b7bff", "#5fe0a8", "#ffd166"];
// "Golden confetti" beer-shop cosmetic
const GOLD_PALETTE = ["#ffd45e", "#f5b942", "#e8a412", "#fff3c4", "#b8860b", "#ffe28a"];

function activePalette(): string[] {
  try {
    const raw = localStorage.getItem("polito:game:v1");
    if (raw && (JSON.parse(raw).unlocks ?? []).includes("skin-gold")) return GOLD_PALETTE;
  } catch {
    /* ignore */
  }
  return PALETTE;
}

export function fireConfetti(opts: { count?: number; originY?: number } = {}) {
  if (typeof document === "undefined") return;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "9999",
  } as CSSStyleDeclaration);
  document.body.appendChild(canvas);
  const palette = activePalette();
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const count = opts.count ?? 140;
  const oy = (opts.originY ?? 0.45) * H;
  const parts: Particle[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 6 + Math.random() * 9;
    return {
      x: W / 2 + (Math.random() - 0.5) * 80,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      size: 5 + Math.random() * 6,
      color: palette[Math.floor(Math.random() * palette.length)],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.3,
      shape: Math.random() > 0.5 ? 0 : 1,
    };
  });

  let frame = 0;
  let raf = 0;
  const tick = () => {
    frame += 1;
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of parts) {
      p.vy += 0.28; // gravity
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y < H + 30) alive = true;
      const fade = Math.max(0, 1 - frame / 160);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 0) ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (alive && frame < 200) raf = requestAnimationFrame(tick);
    else canvas.remove();
  };
  raf = requestAnimationFrame(tick);
  // safety net if the tab is hidden mid-burst
  window.setTimeout(() => {
    cancelAnimationFrame(raf);
    canvas.remove();
  }, 5000);
}
