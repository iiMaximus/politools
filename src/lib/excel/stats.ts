/* ================================================================== *
 *  Numerical statistics — special functions behind the Excel
 *  distribution functions used in the ESMM course.
 *
 *  No external dependencies (AGENTS.md). Accuracy target ~1e-10,
 *  verified against Excel's cached values in the course's lab files
 *  via scripts/verify-excel-engine.mjs.
 *
 *  Methods: Lanczos log-gamma, Numerical-Recipes-style incomplete
 *  gamma (series + continued fraction) and regularized incomplete
 *  beta (Lentz continued fraction). CDF inverses by bracket+bisection,
 *  with Acklam's rational approximation seeding the normal inverse.
 * ================================================================== */

const SQRT2 = Math.SQRT2;
const SQRT2PI = Math.sqrt(2 * Math.PI);

/* ----------------------------- gamma ------------------------------ */

const LANCZOS = [
  676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012,
  9.9843695780195716e-6, 1.5056327351493116e-7,
];

/** Natural log of the Gamma function (Lanczos approximation). */
export function gammaln(x: number): number {
  if (x < 0.5) {
    // reflection formula
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - gammaln(1 - x);
  }
  x -= 1;
  let a = 0.99999999999980993;
  const t = x + 7.5;
  for (let i = 0; i < LANCZOS.length; i++) a += LANCZOS[i] / (x + i + 1);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/** ln of the binomial coefficient C(n, k). */
function lnComb(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return gammaln(n + 1) - gammaln(k + 1) - gammaln(n - k + 1);
}

/* ----------------------- incomplete gamma ------------------------- */

/** Lower regularized incomplete gamma P(a, x) via series. */
function gser(a: number, x: number): number {
  if (x <= 0) return 0;
  let ap = a;
  let sum = 1 / a;
  let del = sum;
  for (let n = 0; n < 1000; n++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * 1e-15) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - gammaln(a));
}

/** Upper regularized incomplete gamma Q(a, x) via continued fraction. */
function gcf(a: number, x: number): number {
  const tiny = 1e-300;
  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return Math.exp(-x + a * Math.log(x) - gammaln(a)) * h;
}

/** Lower regularized incomplete gamma P(a, x). */
export function gammp(a: number, x: number): number {
  if (x < 0 || a <= 0) return NaN;
  if (x === 0) return 0;
  return x < a + 1 ? gser(a, x) : 1 - gcf(a, x);
}

/* --------------------------- erf / normal ------------------------- */

export function erf(x: number): number {
  return x < 0 ? -gammp(0.5, x * x) : gammp(0.5, x * x);
}

export function normPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / SQRT2PI;
}

export function normCdf(z: number): number {
  return 0.5 * (1 + erf(z / SQRT2));
}

/** Inverse standard normal CDF (Acklam) refined with one Halley step. */
export function normInv(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let x: number;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  // one Halley iteration for full double precision
  const e = normCdf(x) - p;
  const u = e * SQRT2PI * Math.exp(0.5 * x * x);
  x = x - u / (1 + (x * u) / 2);
  return x;
}

/* ----------------------- incomplete beta -------------------------- */

function betacf(a: number, b: number, x: number): number {
  const tiny = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m < 1000; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}

/** Regularized incomplete beta I_x(a, b). */
export function betai(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/* ===================== distribution CDFs/PDFs ===================== */

export function studentPdf(t: number, df: number): number {
  return Math.exp(gammaln((df + 1) / 2) - gammaln(df / 2)) / Math.sqrt(df * Math.PI) *
    Math.pow(1 + (t * t) / df, -(df + 1) / 2);
}

/** Left-tailed Student-t CDF P(T <= t). */
export function studentCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const ib = 0.5 * betai(df / 2, 0.5, x);
  return t > 0 ? 1 - ib : ib;
}

export function chisqPdf(x: number, df: number): number {
  if (x < 0) return 0;
  const k = df / 2;
  return Math.exp((k - 1) * Math.log(x) - x / 2 - k * Math.log(2) - gammaln(k));
}

/** Left-tailed chi-square CDF. */
export function chisqCdf(x: number, df: number): number {
  if (x <= 0) return 0;
  return gammp(df / 2, x / 2);
}

export function fPdf(x: number, d1: number, d2: number): number {
  if (x <= 0) return 0;
  const lg = gammaln((d1 + d2) / 2) - gammaln(d1 / 2) - gammaln(d2 / 2);
  return Math.exp(lg + (d1 / 2) * Math.log(d1 / d2) + (d1 / 2 - 1) * Math.log(x) -
    ((d1 + d2) / 2) * Math.log(1 + (d1 * x) / d2));
}

/** Left-tailed Fisher F CDF. */
export function fCdf(x: number, d1: number, d2: number): number {
  if (x <= 0) return 0;
  const y = (d1 * x) / (d1 * x + d2);
  return betai(d1 / 2, d2 / 2, y);
}

/* --------------------------- discrete ----------------------------- */

export function binomPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  return Math.exp(lnComb(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

export function binomCdf(k: number, n: number, p: number): number {
  let s = 0;
  const top = Math.floor(k);
  for (let i = 0; i <= top; i++) s += binomPmf(i, n, p);
  return Math.min(1, s);
}

export function hypgeomPmf(k: number, n: number, C: number, M: number): number {
  if (k < 0 || k > n || k > C || n - k > M - C) return 0;
  return Math.exp(lnComb(C, k) + lnComb(M - C, n - k) - lnComb(M, n));
}

export function hypgeomCdf(k: number, n: number, C: number, M: number): number {
  let s = 0;
  const top = Math.floor(k);
  for (let i = 0; i <= top; i++) s += hypgeomPmf(i, n, C, M);
  return Math.min(1, s);
}

export function poissonPmf(k: number, mean: number): number {
  if (k < 0) return 0;
  return Math.exp(-mean + k * Math.log(mean) - gammaln(k + 1));
}

export function poissonCdf(k: number, mean: number): number {
  let s = 0;
  const top = Math.floor(k);
  for (let i = 0; i <= top; i++) s += poissonPmf(i, mean);
  return Math.min(1, s);
}

/* ------------------------- CDF inverses --------------------------- */

/**
 * Invert a monotone-increasing CDF for the value x with cdf(x) = p.
 * `lo`/`hi` are a starting guess; the bracket is expanded on whichever
 * side does not yet straddle p, then refined by bisection.
 */
function invert(cdf: (x: number) => number, p: number, lo: number, hi: number, floor?: number): number {
  let a = lo;
  let b = hi;
  let guard = 0;
  while (cdf(a) > p && guard++ < 200) {
    a = floor !== undefined ? floor : a - (b - a);
    if (floor !== undefined && a <= floor) { a = floor; break; }
  }
  guard = 0;
  while (cdf(b) < p && guard++ < 200) b += b - a;
  for (let i = 0; i < 200; i++) {
    const mid = 0.5 * (a + b);
    if (cdf(mid) < p) a = mid;
    else b = mid;
    if (b - a < 1e-13 * Math.max(1, Math.abs(b))) break;
  }
  return 0.5 * (a + b);
}

export function studentInv(p: number, df: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  return invert((t) => studentCdf(t, df), p, -1, 1);
}

export function chisqInv(p: number, df: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  return invert((x) => chisqCdf(x, df), p, 0, Math.max(10, df * 4), 0);
}

export function fInv(p: number, d1: number, d2: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;
  return invert((x) => fCdf(x, d1, d2), p, 0, 4, 0);
}

export function binomInv(n: number, p: number, alpha: number): number {
  let cum = 0;
  for (let k = 0; k <= n; k++) {
    cum += binomPmf(k, n, p);
    if (cum >= alpha - 1e-12) return k;
  }
  return n;
}
