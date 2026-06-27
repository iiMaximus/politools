import { useMemo } from "react";
import katex from "katex";

/** Inline math: <Tex>{"\\frac{a}{b}"}</Tex> */
export function Tex({ children }: { children: string }) {
  const html = useMemo(
    () =>
      katex.renderToString(children, {
        throwOnError: false,
        displayMode: false,
      }),
    [children]
  );
  return <span className="katex-inline" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Display (block) math. */
export function TexBlock({ children }: { children: string }) {
  const html = useMemo(
    () =>
      katex.renderToString(children, {
        throwOnError: false,
        displayMode: true,
      }),
    [children]
  );
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
