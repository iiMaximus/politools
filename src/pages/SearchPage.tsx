import { useDeferredValue, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Page, TopBar } from "../components/Layout";
import { Pill } from "../components/ui";
import {
  buildContentIndex,
  searchContent,
  useContentCourses,
  type ContentKind,
} from "../lib/content-index";

const KIND_LABELS: Record<ContentKind, string> = {
  course: "Courses",
  lesson: "Lessons",
  concept: "Concepts",
  formula: "Formulas",
  question: "Questions",
  exam: "Exams",
};

const KIND_ICONS: Record<ContentKind, string> = {
  course: "GraduationCap",
  lesson: "BookOpen",
  concept: "Lightbulb",
  formula: "Sigma",
  question: "CircleHelp",
  exam: "FileCheck",
};

function excerpt(value: string, query: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= 220) return clean;
  const firstToken = query.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  const hit = firstToken ? clean.toLowerCase().indexOf(firstToken) : -1;
  const start = Math.max(0, hit > 90 ? hit - 70 : 0);
  return `${start > 0 ? "…" : ""}${clean.slice(start, start + 220)}…`;
}

export function SearchPage() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [courseId, setCourseId] = useState(() => params.get("course") ?? "");
  const [kind, setKind] = useState<ContentKind | "">(() => {
    const requested = params.get("kind") as ContentKind | null;
    return requested && requested in KIND_LABELS ? requested : "";
  });
  const deferredQuery = useDeferredValue(query);
  const { courses, ready } = useContentCourses();
  const index = useMemo(() => buildContentIndex(courses), [courses]);
  const results = useMemo(
    () =>
      searchContent(index, deferredQuery, {
        courseId: courseId || undefined,
        kind: kind || undefined,
        limit: 100,
      }),
    [courseId, deferredQuery, index, kind]
  );
  const counts = useMemo(() => {
    const next = new Map<ContentKind, number>();
    for (const item of index) next.set(item.kind, (next.get(item.kind) ?? 0) + 1);
    return next;
  }, [index]);

  const hasQuery = deferredQuery.trim().length > 0;

  return (
    <>
      <TopBar crumbs={[{ label: "Search" }]} />
      <Page className="max-w-4xl pt-5 sm:pt-8">
        <section className="mc-panel arcade-dark relative overflow-hidden p-5 text-white sm:p-7">
          <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.035]" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(circle at 88% 12%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 38%)",
            }}
          />
          <div className="relative">
            <div className="pixel-font text-base uppercase leading-none tracking-[0.2em] text-[var(--accent)]">
              Universal content index
            </div>
            <h1 className="pixel-font mt-2 text-4xl uppercase leading-none tracking-wide sm:text-5xl">Find anything</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Search concepts, formulas, lessons, practice questions, source citations, and worked exams
              across every registered course.
            </p>

            <label className="mc-slot mt-5 flex items-center gap-3 px-4 py-3 focus-within:!border-[var(--accent)]">
              <Icon name="Compass" size={20} className="shrink-0 text-[var(--accent)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:font-normal placeholder:text-white/30"
                placeholder="Try entropy, Green theorem, eigenvalue, June 2025…"
                aria-label="Search all course content"
              />
              {query && (
                <button
                  type="button"
                  className="arcade-focus-ring grid h-8 w-8 place-items-center rounded-sm text-white/45 transition hover:bg-black/20 hover:text-white"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <Icon name="X" size={16} />
                </button>
              )}
            </label>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="mc-slot flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/55 focus-within:!border-[var(--accent)]">
                <span className="pixel-font shrink-0 text-base uppercase leading-none">Course</span>
                <select
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  className="min-w-0 flex-1 bg-[#303030] px-2 py-1.5 text-sm text-white outline-none"
                >
                  <option value="">Every course</option>
                  {courses.map((course) => (
                    <option key={course.meta.id} value={course.meta.id}>
                      {course.meta.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mc-slot flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/55 focus-within:!border-[var(--accent)]">
                <span className="pixel-font shrink-0 text-base uppercase leading-none">Type</span>
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as ContentKind | "")}
                  className="min-w-0 flex-1 bg-[#303030] px-2 py-1.5 text-sm text-white outline-none"
                >
                  <option value="">Everything</option>
                  {(Object.keys(KIND_LABELS) as ContentKind[]).map((value) => (
                    <option key={value} value={value}>
                      {KIND_LABELS[value]} ({counts.get(value) ?? 0})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <div className="pixel-font mt-4 flex flex-wrap items-center justify-between gap-2 text-base uppercase leading-none tracking-wide text-[var(--color-faint)]">
          <span>
            {ready ? `${index.length.toLocaleString()} indexed records` : `Indexing… ${index.length.toLocaleString()} ready`}
          </span>
          {hasQuery && <span>{results.length === 100 ? "100+ matches" : `${results.length} matches`}</span>}
        </div>

        {!hasQuery && (
          <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(KIND_LABELS) as ContentKind[]).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setKind(value)}
                className="mc-panel arcade-dark mc-panel-interactive arcade-focus-ring flex items-center gap-3 p-4 text-left text-white"
              >
                <span className="mc-slot grid h-10 w-10 place-items-center text-[var(--accent)]">
                  <Icon name={KIND_ICONS[value]} size={19} />
                </span>
                <span>
                  <span className="pixel-font block text-xl uppercase leading-none">{KIND_LABELS[value]}</span>
                  <span className="mt-1 block text-xs text-white/40">
                    {(counts.get(value) ?? 0).toLocaleString()} indexed
                  </span>
                </span>
              </button>
            ))}
          </section>
        )}

        {hasQuery && results.length > 0 && (
          <section className="mt-4 grid gap-2.5" aria-live="polite">
            {results.map(({ item }) => (
              <Link
                key={item.key}
                to={item.href}
                className="mc-panel arcade-dark mc-panel-interactive arcade-focus-ring group flex gap-3 p-4 text-white sm:p-5"
              >
                <span
                  className="mc-slot mt-0.5 grid h-9 w-9 shrink-0 place-items-center"
                  style={{ background: `${item.accent}20`, color: item.accent }}
                >
                  <Icon name={KIND_ICONS[item.kind]} size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-bold leading-snug transition group-hover:text-[var(--accent)]">{item.title}</span>
                    <Pill tone="neutral" className="!px-2 !py-0.5 !text-[10px]">
                      {item.kind}
                    </Pill>
                  </span>
                  <span className="mt-1 block text-xs font-semibold" style={{ color: item.accent }}>
                    {item.courseShort}{item.topic ? ` · ${item.topic}` : ""}
                  </span>
                  {item.text && (
                    <span className="mt-1.5 block text-sm leading-relaxed text-white/60">
                      {excerpt(item.text, deferredQuery)}
                    </span>
                  )}
                  {item.source && (
                    <span className="mt-1.5 block truncate text-[11px] text-white/40">
                      Source: {item.source}
                    </span>
                  )}
                </span>
                <Icon name="ArrowRight" size={15} className="mt-2 shrink-0 text-white/35" />
              </Link>
            ))}
          </section>
        )}

        {hasQuery && results.length === 0 && ready && (
          <div className="mc-panel arcade-dark mt-4 p-8 text-center text-white">
            <span className="mc-slot mx-auto grid h-12 w-12 place-items-center text-[var(--accent)]">
              <Icon name="CircleHelp" size={24} />
            </span>
            <h2 className="pixel-font mt-3 text-2xl uppercase leading-none">No matching content</h2>
            <p className="mt-2 text-sm text-white/55">
              Try a shorter term or clear the course and type filters.
            </p>
          </div>
        )}
      </Page>
    </>
  );
}
