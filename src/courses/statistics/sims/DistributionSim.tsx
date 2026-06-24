import { useMemo, useState } from "react";
import { SimControls, Slider, Readout, ReadoutRow } from "../../../components/SimKit";
import {
  normPdf, normCdf, studentPdf, studentCdf, chisqPdf, chisqCdf, fPdf, fCdf,
} from "../../../lib/excel/stats";

type Kind = "normal" | "student" | "chisq" | "fisher";

interface Spec {
  pdf: (x: number) => number;
  cdf: (x: number) => number;
  domain: [number, number];
  excel: string;
}

export function DistributionSim({ kind }: { kind: Kind }) {
  const [mean, setMean] = useState(8);
  const [sd, setSd] = useState(0.5);
  const [df, setDf] = useState(5);
  const [df2, setDf2] = useState(10);
  const [x, setX] = useState(kind === "normal" ? 8.5 : kind === "student" ? 1 : 4);

  const spec: Spec = useMemo(() => {
    switch (kind) {
      case "normal":
        return {
          pdf: (t) => normPdf((t - mean) / sd) / sd,
          cdf: (t) => normCdf((t - mean) / sd),
          domain: [mean - 4 * sd, mean + 4 * sd],
          excel: `=NORM.DIST(${x.toFixed(2)}; ${mean}; ${sd}; TRUE)`,
        };
      case "student":
        return {
          pdf: (t) => studentPdf(t, df),
          cdf: (t) => studentCdf(t, df),
          domain: [-5, 5],
          excel: `=T.DIST(${x.toFixed(2)}; ${df}; TRUE)`,
        };
      case "chisq":
        return {
          pdf: (t) => chisqPdf(t, df),
          cdf: (t) => chisqCdf(t, df),
          domain: [0, Math.max(20, df * 3)],
          excel: `=CHISQ.DIST(${x.toFixed(2)}; ${df}; TRUE)`,
        };
      case "fisher":
        return {
          pdf: (t) => fPdf(t, df, df2),
          cdf: (t) => fCdf(t, df, df2),
          domain: [0, 5],
          excel: `=F.DIST(${x.toFixed(2)}; ${df}; ${df2}; TRUE)`,
        };
    }
  }, [kind, mean, sd, df, df2, x]);

  const [lo, hi] = spec.domain;
  const N = 160;
  const pts = useMemo(() => {
    const arr: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const t = lo + ((hi - lo) * i) / N;
      arr.push({ x: t, y: spec.pdf(t) });
    }
    return arr;
  }, [spec, lo, hi]);
  const ymax = Math.max(...pts.map((p) => p.y)) * 1.1 || 1;

  // SVG plot coordinates
  const W = 460;
  const H = 220;
  const padL = 8;
  const padB = 18;
  const sx = (t: number) => padL + ((t - lo) / (hi - lo)) * (W - padL * 2);
  const sy = (y: number) => H - padB - (y / ymax) * (H - padB - 8);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const fillPts = pts.filter((p) => p.x <= x);
  const area =
    `M${sx(fillPts[0]?.x ?? lo).toFixed(1)},${sy(0).toFixed(1)} ` +
    fillPts.map((p) => `L${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ") +
    ` L${sx(x).toFixed(1)},${sy(0).toFixed(1)} Z`;

  const cdf = spec.cdf(x);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_minmax(190px,240px)]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-[var(--color-bg)]" role="img">
        <line x1={padL} y1={H - padB} x2={W - padL} y2={H - padB} stroke="var(--color-line)" />
        <path d={area} fill="var(--accent)" opacity={0.22} />
        <path d={line} fill="none" stroke="var(--accent)" strokeWidth={2} />
        <line x1={sx(x)} y1={8} x2={sx(x)} y2={H - padB} stroke="var(--accent-2)" strokeWidth={1.5} strokeDasharray="4 3" />
        <circle cx={sx(x)} cy={sy(spec.pdf(x))} r={3.5} fill="var(--accent-2)" />
        <text x={sx(x)} y={H - 4} textAnchor="middle" fontSize={11} fill="var(--color-muted)">x = {x.toFixed(2)}</text>
      </svg>

      <div className="flex flex-col gap-3">
        <SimControls>
          {kind === "normal" && (
            <>
              <Slider label="mean m" value={mean} min={0} max={20} step={0.5} onChange={setMean} />
              <Slider label="st. dev s" value={sd} min={0.1} max={4} step={0.1} onChange={setSd} />
            </>
          )}
          {(kind === "student" || kind === "chisq" || kind === "fisher") && (
            <Slider label={kind === "fisher" ? "df₁ (num.)" : "deg. freedom ν"} value={df} min={1} max={30} step={1} onChange={setDf} />
          )}
          {kind === "fisher" && <Slider label="df₂ (den.)" value={df2} min={1} max={30} step={1} onChange={setDf2} />}
          <Slider label="abscissa x" value={x} min={lo} max={hi} step={(hi - lo) / 100} onChange={setX} />
        </SimControls>
        <ReadoutRow>
          <Readout label="f(x) density" value={spec.pdf(x).toFixed(4)} />
          <Readout label="P(X ≤ x)" value={cdf.toFixed(4)} tone="accent" />
        </ReadoutRow>
        <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--color-muted)]">
          {spec.excel} → {cdf.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
