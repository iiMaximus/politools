// Repair double-escaped LaTeX in authored JSON: fields where commands appear as
// "\\mathbb" (two backslashes) instead of "\mathbb" get all backslash-pairs halved.
// A field is only touched if it contains a doubled COMMAND (so genuine "\\" matrix
// row-breaks in correctly-escaped fields are never harmed).
import fs from "node:fs";
import path from "node:path";

const CMDS = [
  "mathbb", "mathrm", "mathbf", "mathcal", "mathscr", "mathit", "boldsymbol", "operatorname",
  "frac", "dfrac", "tfrac", "sqrt", "begin", "end", "left", "right", "text", "mbox",
  "vec", "hat", "bar", "tilde", "dot", "overline", "underline", "widehat", "overrightarrow",
  "cdot", "cdots", "ldots", "dots", "times", "div", "pm", "mp", "ast", "star", "circ", "bullet",
  "leq", "geq", "neq", "approx", "equiv", "cong", "sim", "simeq", "propto", "ll", "gg",
  "in", "notin", "ni", "subset", "subseteq", "supset", "supseteq", "cup", "cap", "setminus",
  "emptyset", "varnothing", "forall", "exists", "nexists", "nabla", "partial", "infty",
  "sum", "prod", "coprod", "int", "oint", "lim", "limsup", "liminf", "log", "ln", "lg",
  "sin", "cos", "tan", "sec", "csc", "cot", "arcsin", "arccos", "arctan", "sinh", "cosh", "tanh", "exp",
  "dim", "ker", "det", "tr", "deg", "rank", "min", "max", "sup", "inf", "gcd", "lcm", "Im", "Re",
  "alpha", "beta", "gamma", "delta", "epsilon", "varepsilon", "zeta", "eta", "theta", "vartheta",
  "iota", "kappa", "lambda", "mu", "nu", "xi", "rho", "varrho", "sigma", "varsigma", "tau",
  "upsilon", "phi", "varphi", "chi", "psi", "omega", "pi", "varpi",
  "Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi", "Sigma", "Upsilon", "Phi", "Psi", "Omega",
  "langle", "rangle", "lfloor", "rfloor", "lceil", "rceil", "lvert", "rvert", "lVert", "rVert", "Vert",
  "to", "rightarrow", "leftarrow", "mapsto", "longmapsto", "Rightarrow", "Leftarrow", "Leftrightarrow",
  "leftrightarrow", "implies", "iff", "oplus", "otimes", "perp", "parallel", "angle", "triangle",
  "begin", "matrix", "pmatrix", "bmatrix", "vmatrix", "cases", "binom", "bmod", "pmod", "quad", "qquad",
  "color", "mathfrak", "prime",
];
const DOUBLED = new RegExp("\\\\\\\\(?:" + CMDS.join("|") + ")", ""); // two backslashes + a command

let fileChanges = 0;
let stringChanges = 0;

function fixString(s) {
  if (typeof s !== "string") return s;
  if (!DOUBLED.test(s)) return s;
  // uniformly halve every backslash-pair in this over-escaped field
  const out = s.replace(/\\\\/g, "\\");
  if (out !== s) stringChanges++;
  return out;
}
function walk(v) {
  if (typeof v === "string") return fixString(v);
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v)) o[k] = walk(v[k]);
    return o;
  }
  return v;
}

function processFile(file) {
  const before = fs.readFileSync(file, "utf8");
  let data;
  try {
    data = JSON.parse(before);
  } catch {
    return;
  }
  const prev = stringChanges;
  const fixed = walk(data);
  const after = JSON.stringify(fixed, null, 2) + "\n";
  if (stringChanges > prev) {
    fs.writeFileSync(file, after);
    fileChanges++;
    console.log(`  fixed ${stringChanges - prev} field(s): ${path.relative(process.cwd(), file)}`);
  }
}

function findJson(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findJson(p));
    else if (e.name.endsWith(".json")) out.push(p);
  }
  return out;
}

const root = process.argv[2] || "src/courses";
for (const f of findJson(root)) processFile(f);
console.log(`Done. ${stringChanges} fields repaired across ${fileChanges} files.`);
