import { Fragment, type ReactNode } from "react";
import { Tex, TexBlock } from "../lib/math";

/* ------------------------------------------------------------------ *
 * RichText — renders authored strings with light markup:
 *   $inline math$, $$block math$$, **bold**, "- " bullet lines,
 *   blank-line paragraphs.
 * Used so data-authored content (lessons/MCQs/exams) can carry math.
 * ------------------------------------------------------------------ */

function renderInline(text: string, keyBase: string): ReactNode[] {
  // split on $...$ inline math and **bold**
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    const key = `${keyBase}-${i}`;
    if (p.startsWith("$") && p.endsWith("$") && p.length > 1) {
      return <Tex key={key}>{p.slice(1, -1)}</Tex>;
    }
    if (p.startsWith("**") && p.endsWith("**") && p.length > 3) {
      // recurse so math ($...$) inside bold still renders
      return <strong key={key}>{renderInline(p.slice(2, -2), key)}</strong>;
    }
    return <Fragment key={key}>{p}</Fragment>;
  });
}

function renderParagraphs(text: string, keyBase: string): ReactNode {
  const paras = text.split(/\n{2,}/).filter((p) => p.trim().length);
  return paras.map((para, pi) => {
    const lines = para.split("\n");
    const isList = lines.every((l) => l.trim().startsWith("- ") || l.trim() === "");
    if (isList) {
      const items = lines.filter((l) => l.trim().startsWith("- "));
      return (
        <ul key={`${keyBase}-p${pi}`} className="my-2 ml-5 list-disc space-y-1">
          {items.map((l, li) => (
            <li key={li}>{renderInline(l.trim().slice(2), `${keyBase}-p${pi}-${li}`)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={`${keyBase}-p${pi}`}>
        {lines.map((l, li) => (
          <Fragment key={li}>
            {li > 0 && <br />}
            {renderInline(l, `${keyBase}-p${pi}-${li}`)}
          </Fragment>
        ))}
      </p>
    );
  });
}

export function RichText({ children, inline }: { children: string; inline?: boolean }) {
  if (inline) return <>{renderInline(children, "i")}</>;
  // split out $$ block math $$ first
  const segments = children.split(/\$\$([^$]+)\$\$/g);
  return (
    <>
      {segments.map((seg, i) =>
        i % 2 === 1 ? (
          <TexBlock key={i}>{seg}</TexBlock>
        ) : (
          <Fragment key={i}>{renderParagraphs(seg, `s${i}`)}</Fragment>
        )
      )}
    </>
  );
}

/** Wrap a string in RichText (block); pass ReactNode through unchanged. */
export function rt(v: ReactNode): ReactNode {
  return typeof v === "string" ? <RichText>{v}</RichText> : v;
}

/** Inline variant (no <p>/<ul> wrappers) — for MCQ options and tight spots. */
export function rtInline(v: ReactNode): ReactNode {
  return typeof v === "string" ? <RichText inline>{v}</RichText> : v;
}
