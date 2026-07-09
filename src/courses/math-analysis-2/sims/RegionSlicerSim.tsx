import { useState } from "react";
import { Slider, Readout, SimControls, ReadoutRow, SimButton } from "../../../components/SimKit";
import { Tex } from "../../../lib/math";

/* ------------------------------------------------------------------ *
 * Region slicer — the "sketch first" habit, made interactive.
 *
 * Pick a plane region and an integration order. The sim shades the
 * region, draws the representative slice (a vertical strip for
 * "dy first", a horizontal strip for "dx first"), and shows the
 * correct iterated-integral limits for that choice.
 *
 * The point the student must internalize:
 *   - the INNER limits are read off the curves the slice enters/exits
 *     (they may depend on the outer variable),
 *   - the OUTER limits are the extreme positions of the slice
 *     (always plain numbers).
 *
 * All limits below are exact:
 *   parabola:  D = {0 ≤ x ≤ 2,  x² ≤ y ≤ 2x}
 *              = {0 ≤ y ≤ 4,  y/2 ≤ x ≤ √y}          (area 4/3)
 *   quarter:   D = {0 ≤ x ≤ 2,  0 ≤ y ≤ √(4−x²)}
 *              = {0 ≤ y ≤ 2,  0 ≤ x ≤ √(4−y²)}       (area π)
 *   triangle:  D = {0 ≤ x ≤ 2,  0 ≤ y ≤ x}
 *              = {0 ≤ y ≤ 2,  y ≤ x ≤ 2}             (area 2)
 * ------------------------------------------------------------------ */

const W = 380; // svg width
const H = 380; // svg height

type Order = "dyFirst" | "dxFirst";
type RegionId = "parabola" | "quarter" | "triangle";

interface RegionDef {
  id: RegionId;
  label: string;
  /** math window drawn in the SVG (kept square so circles look round) */
  view: { x0: number; x1: number; y0: number; y1: number };
  /** vertical-strip description: x in xRange, yLow(x) ≤ y ≤ yHigh(x) */
  xRange: [number, number];
  yLow: (x: number) => number;
  yHigh: (x: number) => number;
  /** horizontal-strip description: y in yRange, xLow(y) ≤ x ≤ xHigh(y) */
  yRange: [number, number];
  xLow: (y: number) => number;
  xHigh: (y: number) => number;
  /** KaTeX for each order: full iterated integral + inner/outer limits */
  tex: Record<Order, { integral: string; inner: string; outer: string }>;
  /** labels pinned next to the boundary curves (math coords) */
  curveLabels: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end" }[];
  /** exact area, for the readout */
  areaTex: string;
}

const REGIONS: RegionDef[] = [
  {
    id: "parabola",
    label: "Between y = x² and y = 2x",
    view: { x0: -1.4, x1: 3.6, y0: -0.6, y1: 4.4 },
    xRange: [0, 2],
    yLow: (x) => x * x,
    yHigh: (x) => 2 * x,
    yRange: [0, 4],
    xLow: (y) => y / 2,
    xHigh: (y) => Math.sqrt(Math.max(0, y)),
    tex: {
      dyFirst: {
        integral: "\\int_{0}^{2}\\!\\!\\int_{x^{2}}^{2x} f\\;dy\\,dx",
        inner: "x^{2}\\le y\\le 2x",
        outer: "0\\le x\\le 2",
      },
      dxFirst: {
        integral: "\\int_{0}^{4}\\!\\!\\int_{y/2}^{\\sqrt{y}} f\\;dx\\,dy",
        inner: "\\tfrac{y}{2}\\le x\\le \\sqrt{y}",
        outer: "0\\le y\\le 4",
      },
    },
    curveLabels: [
      { x: 2.25, y: 3.35, text: "y = x²", anchor: "start" },
      { x: 1.15, y: 2.75, text: "y = 2x", anchor: "end" },
    ],
    areaTex: "\\tfrac{4}{3}",
  },
  {
    id: "quarter",
    label: "Quarter disk r = 2",
    view: { x0: -0.5, x1: 2.7, y0: -0.5, y1: 2.7 },
    xRange: [0, 2],
    yLow: () => 0,
    yHigh: (x) => Math.sqrt(Math.max(0, 4 - x * x)),
    yRange: [0, 2],
    xLow: () => 0,
    xHigh: (y) => Math.sqrt(Math.max(0, 4 - y * y)),
    tex: {
      dyFirst: {
        integral: "\\int_{0}^{2}\\!\\!\\int_{0}^{\\sqrt{4-x^{2}}} f\\;dy\\,dx",
        inner: "0\\le y\\le \\sqrt{4-x^{2}}",
        outer: "0\\le x\\le 2",
      },
      dxFirst: {
        integral: "\\int_{0}^{2}\\!\\!\\int_{0}^{\\sqrt{4-y^{2}}} f\\;dx\\,dy",
        inner: "0\\le x\\le \\sqrt{4-y^{2}}",
        outer: "0\\le y\\le 2",
      },
    },
    curveLabels: [{ x: 1.62, y: 1.68, text: "x² + y² = 4", anchor: "start" }],
    areaTex: "\\pi",
  },
  {
    id: "triangle",
    label: "Triangle (0,0)(2,0)(2,2)",
    view: { x0: -0.5, x1: 2.7, y0: -0.5, y1: 2.7 },
    xRange: [0, 2],
    yLow: () => 0,
    yHigh: (x) => x,
    yRange: [0, 2],
    xLow: (y) => y,
    xHigh: () => 2,
    tex: {
      dyFirst: {
        integral: "\\int_{0}^{2}\\!\\!\\int_{0}^{x} f\\;dy\\,dx",
        inner: "0\\le y\\le x",
        outer: "0\\le x\\le 2",
      },
      dxFirst: {
        integral: "\\int_{0}^{2}\\!\\!\\int_{y}^{2} f\\;dx\\,dy",
        inner: "y\\le x\\le 2",
        outer: "0\\le y\\le 2",
      },
    },
    curveLabels: [
      { x: 0.85, y: 1.2, text: "y = x", anchor: "end" },
      { x: 2.1, y: 0.95, text: "x = 2", anchor: "start" },
    ],
    areaTex: "2",
  },
];

export function RegionSlicerSim() {
  const [regionId, setRegionId] = useState<RegionId>("parabola");
  const [order, setOrder] = useState<Order>("dyFirst");
  const [t, setT] = useState(0.5); // slice position as a fraction of the outer range

  const region = REGIONS.find((r) => r.id === regionId)!;
  const isDy = order === "dyFirst";
  const { view } = region;

  // math → pixel maps (per-region window, y up)
  const sx = W / (view.x1 - view.x0);
  const sy = H / (view.y1 - view.y0);
  const X = (x: number) => (x - view.x0) * sx;
  const Y = (y: number) => (view.y1 - y) * sy;

  // region outline: sample the lower boundary left→right, upper right→left
  const N = 90;
  const [a, b] = region.xRange;
  const outline: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = a + ((b - a) * i) / N;
    outline.push(`${X(x).toFixed(1)},${Y(region.yLow(x)).toFixed(1)}`);
  }
  for (let i = N; i >= 0; i--) {
    const x = a + ((b - a) * i) / N;
    outline.push(`${X(x).toFixed(1)},${Y(region.yHigh(x)).toFixed(1)}`);
  }

  // representative slice at outer-variable value `pos`
  const [o0, o1] = isDy ? region.xRange : region.yRange;
  const stripW = (o1 - o0) * 0.05;
  const pos = Math.min(o1 - stripW / 2, Math.max(o0 + stripW / 2, o0 + t * (o1 - o0)));
  const lo = isDy ? region.yLow(pos) : region.xLow(pos); // slice enters here
  const hi = isDy ? region.yHigh(pos) : region.xHigh(pos); // slice exits here

  const strip = isDy
    ? {
        x: X(pos - stripW / 2),
        y: Y(hi),
        w: X(pos + stripW / 2) - X(pos - stripW / 2),
        h: Math.max(Y(lo) - Y(hi), 1),
      }
    : {
        x: X(lo),
        y: Y(pos + stripW / 2),
        w: Math.max(X(hi) - X(lo), 1),
        h: Y(pos - stripW / 2) - Y(pos + stripW / 2),
      };

  // integer grid lines inside the window
  const gridX: number[] = [];
  for (let k = Math.ceil(view.x0); k <= Math.floor(view.x1); k++) gridX.push(k);
  const gridY: number[] = [];
  for (let k = Math.ceil(view.y0); k <= Math.floor(view.y1); k++) gridY.push(k);

  const texNow = region.tex[order];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        {/* region presets */}
        <div className="mb-2 flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <SimButton key={r.id} active={regionId === r.id} onClick={() => setRegionId(r.id)}>
              {r.label}
            </SimButton>
          ))}
        </div>
        {/* order toggle */}
        <div className="mb-3 flex flex-wrap gap-2">
          <SimButton active={isDy} onClick={() => setOrder("dyFirst")}>
            Integrate dy first (vertical slice)
          </SimButton>
          <SimButton active={!isDy} onClick={() => setOrder("dxFirst")}>
            Integrate dx first (horizontal slice)
          </SimButton>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]">
          {/* grid */}
          {gridX.map((k) => (
            <line
              key={`gx${k}`}
              x1={X(k)}
              y1={0}
              x2={X(k)}
              y2={H}
              stroke={k === 0 ? "var(--color-muted)" : "var(--color-line)"}
              strokeWidth={k === 0 ? 1.5 : 1}
              opacity={k === 0 ? 0.9 : 0.5}
            />
          ))}
          {gridY.map((k) => (
            <line
              key={`gy${k}`}
              x1={0}
              y1={Y(k)}
              x2={W}
              y2={Y(k)}
              stroke={k === 0 ? "var(--color-muted)" : "var(--color-line)"}
              strokeWidth={k === 0 ? 1.5 : 1}
              opacity={k === 0 ? 0.9 : 0.5}
            />
          ))}
          {/* integer tick labels along the axes */}
          {gridX
            .filter((k) => k !== 0)
            .map((k) => (
              <text key={`tx${k}`} x={X(k) + 3} y={Y(0) + 13} fontSize={9} fill="var(--color-faint)">
                {k}
              </text>
            ))}
          {gridY
            .filter((k) => k !== 0)
            .map((k) => (
              <text key={`ty${k}`} x={X(0) - 5} y={Y(k) + 4} textAnchor="end" fontSize={9} fill="var(--color-faint)">
                {k}
              </text>
            ))}

          {/* the region */}
          <polygon
            points={outline.join(" ")}
            fill="var(--accent)"
            fillOpacity={0.16}
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* representative slice */}
          <rect
            x={strip.x}
            y={strip.y}
            width={strip.w}
            height={strip.h}
            fill="var(--accent-2)"
            fillOpacity={0.55}
            stroke="var(--accent-2)"
            strokeWidth={1.5}
          />
          {/* entry / exit points of the slice */}
          {isDy ? (
            <>
              <circle cx={X(pos)} cy={Y(lo)} r={4.5} fill="var(--warn)" stroke="var(--color-bg)" strokeWidth={1.5} />
              <circle cx={X(pos)} cy={Y(hi)} r={4.5} fill="var(--good)" stroke="var(--color-bg)" strokeWidth={1.5} />
            </>
          ) : (
            <>
              <circle cx={X(lo)} cy={Y(pos)} r={4.5} fill="var(--warn)" stroke="var(--color-bg)" strokeWidth={1.5} />
              <circle cx={X(hi)} cy={Y(pos)} r={4.5} fill="var(--good)" stroke="var(--color-bg)" strokeWidth={1.5} />
            </>
          )}

          {/* curve labels */}
          {region.curveLabels.map((l) => (
            <text
              key={l.text}
              x={X(l.x)}
              y={Y(l.y)}
              textAnchor={l.anchor ?? "start"}
              fontSize={11}
              fontWeight={600}
              fill="var(--color-muted)"
            >
              {l.text}
            </text>
          ))}

          {/* axis names */}
          <text x={W - 10} y={Y(0) - 6} textAnchor="end" fontSize={11} fill="var(--color-faint)">
            x
          </text>
          <text x={X(0) + 6} y={12} fontSize={11} fill="var(--color-faint)">
            y
          </text>
        </svg>

        <p className="mt-2 text-xs leading-relaxed text-[var(--color-faint)]">
          The slice enters the region at the orange dot (inner <em>lower</em> limit) and leaves at the
          green dot (inner <em>upper</em> limit). Slide it across: the entry/exit curves stay the same
          — those curves ARE the inner limits. The first and last positions of the slice give the
          outer limits.
        </p>
      </div>

      {/* controls + readouts */}
      <div className="w-full lg:w-72">
        <SimControls>
          <div className="sm:col-span-2">
            <Slider
              label={isDy ? "Slice position x" : "Slice position y"}
              value={t}
              min={0}
              max={1}
              step={0.01}
              onChange={setT}
              format={() => pos.toFixed(2)}
            />
          </div>
        </SimControls>

        <div className="mt-4 space-y-2">
          <Readout label="Iterated integral (this order)" value={<Tex>{texNow.integral}</Tex>} tone="accent" />
          <ReadoutRow>
            <Readout label="Outer limits" value={<Tex>{texNow.outer}</Tex>} />
            <Readout label="Inner limits" value={<Tex>{texNow.inner}</Tex>} />
          </ReadoutRow>
          <ReadoutRow>
            <Readout
              label={isDy ? "This slice: y runs" : "This slice: x runs"}
              value={`${lo.toFixed(2)} → ${hi.toFixed(2)}`}
              tone="good"
            />
            <Readout label="Region area" value={<Tex>{region.areaTex}</Tex>} />
          </ReadoutRow>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--color-faint)]">
          {isDy ? (
            <>
              Vertical slices ⇒ inner variable is <strong>y</strong>: its limits may depend on x. The
              outer x-limits are plain numbers — the leftmost and rightmost slice.
            </>
          ) : (
            <>
              Horizontal slices ⇒ inner variable is <strong>x</strong>: its limits may depend on y. The
              outer y-limits are plain numbers — the lowest and highest slice.
            </>
          )}{" "}
          Toggle the order and watch the limits change while the region (and the area) stays the same.
        </p>
      </div>
    </div>
  );
}
