import { useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";

/* ------------------------------------------------------------------ *
 * Gradient explorer for  f(x,y) = x² + 2y².
 *
 * Everything shown is computed from the exact analytic formulas:
 *
 *   ∇f(x,y) = (2x, 4y)
 *   D_v f   = 2x·cosθ + 4y·sinθ          (v = (cosθ, sinθ), unit)
 *   |∇f|    = √(4x² + 16y²)              (max of D_v f over all θ)
 *
 * Level curves f = c are the ellipses x²/c + y²/(c/2) = 1, drawn as
 * exact SVG ellipses with semi-axes √c and √(c/2). The level curve
 * through the current point is highlighted so the student SEES that
 * the gradient arrow is perpendicular to it.
 * ------------------------------------------------------------------ */

const W = 380;
const H = 380;
const RANGE = 2; // window is [-2, 2] × [-2, 2]
const SCALE = W / (2 * RANGE); // pixels per math unit

const xPix = (x: number) => ((x + RANGE) / (2 * RANGE)) * W;
const yPix = (y: number) => ((RANGE - y) / (2 * RANGE)) * H; // y up

const f = (x: number, y: number) => x * x + 2 * y * y;

// contour levels for f = x² + 2y² on this window (f ranges 0 … 12)
const LEVELS = [0.25, 0.75, 1.5, 2.5, 4, 6, 8, 10];
const LABELED = [0.75, 1.5, 2.5];

/** Line + triangular head, drawn in pixel coordinates. */
function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 2.5,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
}) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const L = 9; // arrowhead size in px
  const b1 = ang + 2.65;
  const b2 = ang - 2.65;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon
        points={`${x2},${y2} ${x2 + L * Math.cos(b1)},${y2 + L * Math.sin(b1)} ${x2 + L * Math.cos(b2)},${y2 + L * Math.sin(b2)}`}
        fill={color}
      />
    </g>
  );
}

const clampCoord = (v: number) => Math.max(-1.9, Math.min(1.9, Math.round(v * 20) / 20));

export function GradientExplorerSim() {
  const [x0, setX0] = useState(1.2);
  const [y0, setY0] = useState(0.7);
  const [thetaDeg, setThetaDeg] = useState(30);
  const [dragging, setDragging] = useState(false);

  // ---- exact analytic values ----
  const gx = 2 * x0; // f_x
  const gy = 4 * y0; // f_y
  const mag = Math.hypot(gx, gy); // |∇f| = max D_v f
  const th = (thetaDeg * Math.PI) / 180;
  const vx = Math.cos(th);
  const vy = Math.sin(th);
  const dv = gx * vx + gy * vy; // D_v f = ∇f · v
  const c0 = f(x0, y0); // level through the point

  const ascentDeg = () => Math.round(((Math.atan2(gy, gx) * 180) / Math.PI + 360) % 360);

  // ---- drawing geometry (pixels) ----
  const px = xPix(x0);
  const py = yPix(y0);
  const GRAD_SCALE = 0.15; // math units drawn per unit of |∇f|
  const gTipX = xPix(x0 + gx * GRAD_SCALE);
  const gTipY = yPix(y0 + gy * GRAD_SCALE);
  const VLEN = 0.55; // drawn length of the (unit) direction vector, math units
  const vTipX = xPix(x0 + vx * VLEN);
  const vTipY = yPix(y0 + vy * VLEN);

  const dirColor = dv > 0.02 ? "var(--good)" : dv < -0.02 ? "var(--bad)" : "var(--color-muted)";

  function pointFromEvent(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 2 * RANGE - RANGE;
    const my = RANGE - ((e.clientY - rect.top) / rect.height) * 2 * RANGE;
    return { x: clampCoord(mx), y: clampCoord(my) };
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full cursor-crosshair rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
            const p = pointFromEvent(e);
            setX0(p.x);
            setY0(p.y);
          }}
          onPointerMove={(e) => {
            if (!dragging) return;
            const p = pointFromEvent(e);
            setX0(p.x);
            setY0(p.y);
          }}
          onPointerUp={() => setDragging(false)}
        >
          {/* axes */}
          <line x1={0} y1={yPix(0)} x2={W} y2={yPix(0)} stroke="var(--color-line)" strokeWidth={1} />
          <line x1={xPix(0)} y1={0} x2={xPix(0)} y2={H} stroke="var(--color-line)" strokeWidth={1} />

          {/* contour ellipses x²/c + y²/(c/2) = 1 */}
          {LEVELS.map((c) => (
            <ellipse
              key={c}
              cx={xPix(0)}
              cy={yPix(0)}
              rx={Math.sqrt(c) * SCALE}
              ry={Math.sqrt(c / 2) * SCALE}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth={1.2}
            />
          ))}
          {LABELED.map((c) => (
            <text
              key={c}
              x={xPix(Math.sqrt(c)) + 3}
              y={yPix(0) - 4}
              fontSize={9}
              fill="var(--color-faint)"
            >
              {c}
            </text>
          ))}

          {/* level curve through the current point (the one ∇f is ⟂ to) */}
          {c0 > 0.001 && (
            <ellipse
              cx={xPix(0)}
              cy={yPix(0)}
              rx={Math.sqrt(c0) * SCALE}
              ry={Math.sqrt(c0 / 2) * SCALE}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="6 5"
              opacity={0.8}
            />
          )}

          {/* gradient arrow (steepest ascent) */}
          {mag > 0.01 && <Arrow x1={px} y1={py} x2={gTipX} y2={gTipY} color="var(--accent)" width={3} />}

          {/* chosen direction v (unit vector, drawn at fixed length) */}
          <Arrow x1={px} y1={py} x2={vTipX} y2={vTipY} color={dirColor} width={2.5} />

          {/* the point P */}
          <circle
            cx={px}
            cy={py}
            r={6}
            fill="var(--color-surface)"
            stroke="var(--color-ink)"
            strokeWidth={2}
            className="cursor-grab"
          />

          {/* legend */}
          <text x={8} y={16} fontSize={10} fill="var(--accent)" fontWeight={700}>
            ∇f (steepest ascent)
          </text>
          <text x={8} y={30} fontSize={10} fill="var(--color-muted)">
            v = (cos θ, sin θ) — green: uphill, red: downhill
          </text>
          <text x={W - 8} y={16} textAnchor="end" fontSize={10} fill="var(--color-faint)">
            f(x,y) = x² + 2y²
          </text>
        </svg>

        <p className="mt-2 text-xs leading-relaxed text-[var(--color-faint)]">
          Drag the point (or use the sliders) and spin θ. The dashed ellipse is the level curve
          f = {c0.toFixed(2)} through P — the gradient arrow is always perpendicular to it, and the
          direction arrow turns gray exactly when it is tangent to the ellipse (D<sub>v</sub>f = 0).
        </p>
      </div>

      <div className="w-full lg:w-72">
        <SimControls>
          <Slider label="Point x₀" value={x0} min={-1.9} max={1.9} step={0.1} onChange={(v) => setX0(clampCoord(v))} format={(v) => v.toFixed(2)} />
          <Slider label="Point y₀" value={y0} min={-1.9} max={1.9} step={0.1} onChange={(v) => setY0(clampCoord(v))} format={(v) => v.toFixed(2)} />
          <div className="sm:col-span-2">
            <Slider label="Direction angle θ" value={thetaDeg} min={0} max={360} step={1} unit="°" onChange={setThetaDeg} />
          </div>
        </SimControls>

        <div className="mt-3 flex flex-wrap gap-2">
          <SimButton onClick={() => mag > 1e-6 && setThetaDeg(ascentDeg())}>Steepest ascent</SimButton>
          <SimButton onClick={() => mag > 1e-6 && setThetaDeg((ascentDeg() + 180) % 360)}>Steepest descent</SimButton>
          <SimButton onClick={() => mag > 1e-6 && setThetaDeg((ascentDeg() + 90) % 360)}>Along level curve</SimButton>
        </div>

        <div className="mt-4 space-y-2">
          <Readout label="∇f(x₀, y₀) = (2x₀, 4y₀)" value={`(${gx.toFixed(2)}, ${gy.toFixed(2)})`} tone="accent" />
          <Readout
            label="D_v f = 2x₀·cos θ + 4y₀·sin θ"
            value={`${gx.toFixed(2)}·(${vx.toFixed(2)}) + ${gy.toFixed(2)}·(${vy.toFixed(2)})`}
          />
          <ReadoutRow>
            <Readout label="D_v f (this θ)" value={dv.toFixed(3)} tone={dv > 0.02 ? "good" : dv < -0.02 ? "bad" : "default"} />
            <Readout label="|∇f| = max D_v f" value={mag.toFixed(3)} tone="accent" />
          </ReadoutRow>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          Press <strong>Steepest ascent</strong>: D<sub>v</sub>f snaps to |∇f| (up to the 1°
          rounding of θ). Press <strong>Along level curve</strong>: it drops to ≈ 0 — moving along a
          contour changes nothing, which is exactly why ∇f must be perpendicular to it.
        </p>
      </div>
    </div>
  );
}
