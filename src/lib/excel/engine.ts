/* ================================================================== *
 *  Formula engine: tokenizer -> recursive-descent parser -> evaluator.
 *  Supports cell refs (A1, $A$1, B$2), ranges (A1:A20), numbers,
 *  strings, booleans, the operators ^ * / + - & = <> < <= > >=, unary
 *  minus, trailing %, and function calls (',' or ';' arg separators).
 * ================================================================== */

import { FUNCTIONS } from "./functions";
import { type Arg, type CellValue, ExcelError } from "./types";

/* ----------------------- address helpers -------------------------- */

export function colToIndex(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export function indexToCol(i: number): string {
  let s = "";
  i += 1;
  while (i > 0) {
    const r = (i - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

const ADDR_RE = /^\$?([A-Za-z]+)\$?(\d+)$/;

export function parseAddr(addr: string): { col: number; row: number } | null {
  const m = ADDR_RE.exec(addr);
  if (!m) return null;
  return { col: colToIndex(m[1]), row: parseInt(m[2], 10) };
}

export function makeAddr(col: number, row: number): string {
  return indexToCol(col) + row;
}

/** Canonical key for a cell address: strip absolute-ref `$`, uppercase. */
export function canonAddr(addr: string): string {
  return addr.replace(/\$/g, "").toUpperCase();
}

/* ---------------------------- tokens ------------------------------ */

type Tok =
  | { t: "num"; v: number }
  | { t: "str"; v: string }
  | { t: "id"; v: string }
  | { t: "op"; v: string }
  | { t: "lp" } | { t: "rp" } | { t: "sep" } | { t: "colon" } | { t: "pct" };

function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const n = src.length;
  const isDigit = (c: string) => c >= "0" && c <= "9";
  const isIdStart = (c: string) => /[A-Za-z_$]/.test(c);
  const isIdChar = (c: string) => /[A-Za-z0-9_$.]/.test(c);
  while (i < n) {
    const c = src[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") { i++; continue; }
    if (c === '"') {
      let s = "";
      i++;
      while (i < n) {
        if (src[i] === '"') {
          if (src[i + 1] === '"') { s += '"'; i += 2; continue; }
          i++;
          break;
        }
        s += src[i++];
      }
      toks.push({ t: "str", v: s });
      continue;
    }
    if (isDigit(c) || (c === "." && isDigit(src[i + 1]))) {
      let j = i;
      while (j < n && (isDigit(src[j]) || src[j] === ".")) j++;
      // scientific notation
      if (src[j] === "e" || src[j] === "E") {
        j++;
        if (src[j] === "+" || src[j] === "-") j++;
        while (j < n && isDigit(src[j])) j++;
      }
      toks.push({ t: "num", v: parseFloat(src.slice(i, j)) });
      i = j;
      continue;
    }
    if (isIdStart(c)) {
      let j = i;
      while (j < n && isIdChar(src[j])) j++;
      toks.push({ t: "id", v: src.slice(i, j) });
      i = j;
      continue;
    }
    if (c === "(") { toks.push({ t: "lp" }); i++; continue; }
    if (c === ")") { toks.push({ t: "rp" }); i++; continue; }
    if (c === "," || c === ";") { toks.push({ t: "sep" }); i++; continue; }
    if (c === ":") { toks.push({ t: "colon" }); i++; continue; }
    if (c === "%") { toks.push({ t: "pct" }); i++; continue; }
    // operators (two-char first)
    const two = src.slice(i, i + 2);
    if (two === "<=" || two === ">=" || two === "<>") { toks.push({ t: "op", v: two }); i += 2; continue; }
    if ("+-*/^&=<>".includes(c)) { toks.push({ t: "op", v: c }); i++; continue; }
    throw new ExcelError("#NAME?");
  }
  return toks;
}

/* ------------------------------ AST ------------------------------- */

type Node =
  | { k: "num"; v: number }
  | { k: "str"; v: string }
  | { k: "bool"; v: boolean }
  | { k: "ref"; addr: string }
  | { k: "range"; a: string; b: string }
  | { k: "unary"; op: string; x: Node }
  | { k: "pct"; x: Node }
  | { k: "bin"; op: string; l: Node; r: Node }
  | { k: "call"; name: string; args: Node[] };

class Parser {
  private p = 0;
  constructor(private toks: Tok[]) {}
  private peek() { return this.toks[this.p]; }
  private next() { return this.toks[this.p++]; }
  private eat(t: Tok["t"]) {
    const tok = this.toks[this.p];
    if (!tok || tok.t !== t) throw new ExcelError("#ERROR!");
    this.p++;
    return tok;
  }

  parse(): Node {
    const node = this.comparison();
    if (this.p < this.toks.length) throw new ExcelError("#ERROR!");
    return node;
  }

  private comparison(): Node {
    let l = this.concat();
    while (this.peek()?.t === "op" && ["=", "<>", "<", "<=", ">", ">="].includes((this.peek() as { v: string }).v)) {
      const op = (this.next() as { v: string }).v;
      l = { k: "bin", op, l, r: this.concat() };
    }
    return l;
  }
  private concat(): Node {
    let l = this.addsub();
    while (this.peek()?.t === "op" && (this.peek() as { v: string }).v === "&") {
      this.next();
      l = { k: "bin", op: "&", l, r: this.addsub() };
    }
    return l;
  }
  private addsub(): Node {
    let l = this.muldiv();
    while (this.peek()?.t === "op" && ["+", "-"].includes((this.peek() as { v: string }).v)) {
      const op = (this.next() as { v: string }).v;
      l = { k: "bin", op, l, r: this.muldiv() };
    }
    return l;
  }
  private muldiv(): Node {
    let l = this.power();
    while (this.peek()?.t === "op" && ["*", "/"].includes((this.peek() as { v: string }).v)) {
      const op = (this.next() as { v: string }).v;
      l = { k: "bin", op, l, r: this.power() };
    }
    return l;
  }
  private power(): Node {
    const l = this.unary();
    if (this.peek()?.t === "op" && (this.peek() as { v: string }).v === "^") {
      this.next();
      return { k: "bin", op: "^", l, r: this.power() };
    }
    return l;
  }
  private unary(): Node {
    if (this.peek()?.t === "op" && ["+", "-"].includes((this.peek() as { v: string }).v)) {
      const op = (this.next() as { v: string }).v;
      return { k: "unary", op, x: this.unary() };
    }
    return this.postfix();
  }
  private postfix(): Node {
    let x = this.primary();
    while (this.peek()?.t === "pct") { this.next(); x = { k: "pct", x }; }
    return x;
  }
  private primary(): Node {
    const tok = this.peek();
    if (!tok) throw new ExcelError("#ERROR!");
    if (tok.t === "num") { this.next(); return { k: "num", v: tok.v }; }
    if (tok.t === "str") { this.next(); return { k: "str", v: tok.v }; }
    if (tok.t === "lp") { this.next(); const e = this.comparison(); this.eat("rp"); return e; }
    if (tok.t === "op" && tok.v === "-") return this.unary();
    if (tok.t === "id") {
      this.next();
      const name = tok.v;
      if (this.peek()?.t === "lp") {
        this.next();
        const args: Node[] = [];
        if (this.peek()?.t !== "rp") {
          args.push(this.comparison());
          while (this.peek()?.t === "sep") { this.next(); args.push(this.comparison()); }
        }
        this.eat("rp");
        return { k: "call", name: name.toUpperCase().replace(/^_XLFN\./, ""), args };
      }
      const up = name.toUpperCase();
      if (up === "TRUE") return { k: "bool", v: true };
      if (up === "FALSE") return { k: "bool", v: false };
      // cell ref, possibly a range
      if (this.peek()?.t === "colon") {
        this.next();
        const b = this.eat("id") as { v: string };
        return { k: "range", a: name, b: b.v };
      }
      return { k: "ref", addr: name };
    }
    throw new ExcelError("#ERROR!");
  }
}

/* --------------------------- evaluation --------------------------- */

type EvalResult = CellValue | CellValue[][];

function isRange(x: EvalResult): x is CellValue[][] {
  return Array.isArray(x);
}

function toScalarNum(x: EvalResult): number {
  if (isRange(x)) {
    const flat = x.flat();
    if (flat.length === 1) return toScalarNum(flat[0]);
    throw new ExcelError("#VALUE!");
  }
  if (typeof x === "number") return x;
  if (typeof x === "boolean") return x ? 1 : 0;
  if (x === null || x === "") return 0;
  const n = Number(String(x).replace(",", "."));
  if (Number.isNaN(n)) throw new ExcelError("#VALUE!");
  return n;
}

export class Sheet {
  private raw = new Map<string, string>();
  private cache = new Map<string, CellValue>();
  private computing = new Set<string>();

  constructor(raw?: Record<string, string>) {
    if (raw) for (const [k, v] of Object.entries(raw)) this.raw.set(canonAddr(k), v);
  }

  setRaw(addr: string, value: string) {
    this.raw.set(canonAddr(addr), value);
    this.cache.clear();
  }
  rawOf(addr: string): string {
    return this.raw.get(canonAddr(addr)) ?? "";
  }
  isFormula(addr: string): boolean {
    return this.rawOf(addr).startsWith("=");
  }

  /** Computed value of a cell, evaluating dependencies lazily. */
  get(addr: string): CellValue {
    addr = canonAddr(addr);
    if (this.cache.has(addr)) return this.cache.get(addr)!;
    const raw = this.raw.get(addr);
    if (raw === undefined || raw === "") { this.cache.set(addr, null); return null; }
    if (this.computing.has(addr)) throw new ExcelError("#CIRC!");
    this.computing.add(addr);
    let val: CellValue;
    try {
      val = raw.startsWith("=") ? this.scalar(this.evalFormula(raw.slice(1))) : parseLiteral(raw);
    } catch (e) {
      val = e instanceof ExcelError ? e.code : "#ERROR!";
    } finally {
      this.computing.delete(addr);
    }
    this.cache.set(addr, val);
    return val;
  }

  /** Parse + evaluate a formula body (without the leading '='). */
  evalFormulaPublic(body: string): CellValue {
    return this.scalar(this.evalFormula(body));
  }

  private scalar(x: EvalResult): CellValue {
    if (isRange(x)) {
      const flat = x.flat();
      if (flat.length === 1) return flat[0];
      throw new ExcelError("#VALUE!");
    }
    return x;
  }

  private evalFormula(body: string): EvalResult {
    const toks = tokenize(body);
    const ast = new Parser(toks).parse();
    return this.evalNode(ast);
  }

  private evalNode(node: Node): EvalResult {
    switch (node.k) {
      case "num": return node.v;
      case "str": return node.v;
      case "bool": return node.v;
      case "ref": return this.get(node.addr);
      case "range": return this.evalRange(node.a, node.b);
      case "pct": return toScalarNum(this.evalNode(node.x)) / 100;
      case "unary": {
        const v = toScalarNum(this.evalNode(node.x));
        return node.op === "-" ? -v : v;
      }
      case "bin": return this.evalBin(node);
      case "call": return this.evalCall(node);
    }
  }

  private evalRange(a: string, b: string): CellValue[][] {
    const pa = parseAddr(a);
    const pb = parseAddr(b);
    if (!pa || !pb) throw new ExcelError("#REF!");
    const r0 = Math.min(pa.row, pb.row);
    const r1 = Math.max(pa.row, pb.row);
    const c0 = Math.min(pa.col, pb.col);
    const c1 = Math.max(pa.col, pb.col);
    const out: CellValue[][] = [];
    for (let r = r0; r <= r1; r++) {
      const row: CellValue[] = [];
      for (let c = c0; c <= c1; c++) row.push(this.get(makeAddr(c, r)));
      out.push(row);
    }
    return out;
  }

  private evalBin(node: Extract<Node, { k: "bin" }>): EvalResult {
    const op = node.op;
    if (op === "&") {
      const ls = scalarToStr(this.scalar(this.evalNode(node.l)));
      const rs = scalarToStr(this.scalar(this.evalNode(node.r)));
      return ls + rs;
    }
    const l = this.evalNode(node.l);
    const r = this.evalNode(node.r);
    if (["=", "<>", "<", "<=", ">", ">="].includes(op)) {
      return compare(this.scalar(l), this.scalar(r), op);
    }
    const a = toScalarNum(l);
    const b = toScalarNum(r);
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": if (b === 0) throw new ExcelError("#DIV/0!"); return a / b;
      case "^": return Math.pow(a, b);
    }
    throw new ExcelError("#ERROR!");
  }

  private evalCall(node: Extract<Node, { k: "call" }>): EvalResult {
    const fn = FUNCTIONS[node.name];
    if (!fn) throw new ExcelError("#NAME?");
    const args: Arg[] = node.args.map((a) => {
      const v = this.evalNode(a);
      return isRange(v) ? { kind: "range", values: v } : { kind: "scalar", value: v };
    });
    return fn(args);
  }
}

function parseLiteral(raw: string): CellValue {
  const t = raw.trim();
  if (t === "") return null;
  const up = t.toUpperCase();
  if (up === "TRUE") return true;
  if (up === "FALSE") return false;
  // pure number (allow comma decimal)
  const norm = t.replace(",", ".");
  if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(norm)) return parseFloat(norm);
  return raw;
}

function scalarToStr(v: CellValue): string {
  if (v === null) return "";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return String(v);
}

function compare(a: CellValue, b: CellValue, op: string): boolean {
  let cmp: number;
  if (typeof a === "number" && typeof b === "number") cmp = a < b ? -1 : a > b ? 1 : 0;
  else cmp = scalarToStr(a).localeCompare(scalarToStr(b));
  switch (op) {
    case "=": return cmp === 0;
    case "<>": return cmp !== 0;
    case "<": return cmp < 0;
    case "<=": return cmp <= 0;
    case ">": return cmp > 0;
    case ">=": return cmp >= 0;
  }
  return false;
}
