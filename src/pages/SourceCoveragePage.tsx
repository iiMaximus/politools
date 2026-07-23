import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Page, TopBar } from "../components/Layout";
import { Meter, Pill } from "../components/ui";
import {
  buildSourceCoverage,
  useContentCourses,
  type SourceCoverageStatus,
  type SourceKind,
} from "../lib/content-index";

const KIND_LABELS: Record<SourceKind, string> = {
  "past-exam": "Past exam",
  "written-test": "Written test",
  tutorial: "Tutorial",
  lecture: "Lecture material",
  book: "Book / notes",
  other: "Other source",
  uncited: "Uncited",
};

const STATUS_LABELS: Record<SourceCoverageStatus, string> = {
  mapped: "Lesson + practice",
  "practice-only": "Practice only",
  uncited: "Source missing",
};

export function SourceCoveragePage() {
  const { courses, ready } = useContentCourses();
  const groups = useMemo(() => buildSourceCoverage(courses), [courses]);
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState<SourceCoverageStatus | "">("");
  const [kind, setKind] = useState<SourceKind | "">("");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groups.filter((group) => {
      if (courseId && group.courseId !== courseId) return false;
      if (status && group.status !== status) return false;
      if (kind && group.kind !== kind) return false;
      if (!needle) return true;
      return `${group.label} ${group.courseTitle} ${group.topics.join(" ")} ${group.sources.join(" ")}`
        .toLowerCase()
        .includes(needle);
    });
  }, [courseId, groups, kind, query, status]);

  const cited = groups.filter((group) => group.kind !== "uncited").reduce((sum, group) => sum + group.questionCount, 0);
  const total = groups.reduce((sum, group) => sum + group.questionCount, 0);
  const mapped = groups.filter((group) => group.status === "mapped").length;

  return (
    <>
      <TopBar crumbs={[{ label: "Source coverage" }]} />
      <Page className="max-w-5xl pt-5 sm:pt-8">
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
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="pixel-font text-base uppercase leading-none tracking-[0.2em] text-[var(--accent)]">
                Content provenance
              </div>
              <h1 className="pixel-font mt-2 text-4xl uppercase leading-none tracking-wide sm:text-5xl">Source coverage</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
                See which official materials have practice coverage, whether they map back to lessons,
                and where citations are still missing.
              </p>
            </div>
            {!ready && (
              <span className="mc-slot pixel-font flex items-center gap-2 px-3 py-2 text-base uppercase leading-none text-white/55">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-[var(--accent)]" />
                Loading chunks
              </span>
            )}
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="mc-panel arcade-dark p-4 text-white">
            <div className="pixel-font text-3xl leading-none text-[var(--accent)]">{cited.toLocaleString()}</div>
            <div className="pixel-font mt-1 text-base uppercase leading-none text-white/45">cited practice questions</div>
            <Meter value={total ? cited / total : 0} className="mt-3" />
          </div>
          <div className="mc-panel arcade-dark p-4 text-white">
            <div className="pixel-font text-3xl leading-none text-[var(--accent)]">{groups.filter((group) => group.kind !== "uncited").length}</div>
            <div className="pixel-font mt-1 text-base uppercase leading-none text-white/45">distinct source families</div>
            <div className="mt-3 text-[11px] text-white/55">Normalized from each card&apos;s source field</div>
          </div>
          <div className="mc-panel arcade-dark p-4 text-white">
            <div className="pixel-font text-3xl leading-none text-[var(--accent)]">{mapped}</div>
            <div className="pixel-font mt-1 text-base uppercase leading-none text-white/45">sources mapped to lessons</div>
            <div className="mt-3 text-[11px] text-white/55">Deep links connect theory to drills</div>
          </div>
        </section>

        <section className="mc-panel arcade-dark mt-4 grid gap-2 p-4 text-white sm:grid-cols-2 lg:grid-cols-4">
          <label className="mc-slot grid gap-1 p-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/45 focus-within:!border-[var(--accent)]">
            Search source
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="June 2025, tutorial…"
              className="bg-[#303030] px-2 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/25"
            />
          </label>
          <label className="mc-slot grid gap-1 p-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/45 focus-within:!border-[var(--accent)]">
            Course
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              className="bg-[#303030] px-2 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none"
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course.meta.id} value={course.meta.id}>{course.meta.title}</option>
              ))}
            </select>
          </label>
          <label className="mc-slot grid gap-1 p-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/45 focus-within:!border-[var(--accent)]">
            Source type
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as SourceKind | "")}
              className="bg-[#303030] px-2 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none"
            >
              <option value="">All types</option>
              {(Object.keys(KIND_LABELS) as SourceKind[]).map((value) => (
                <option key={value} value={value}>{KIND_LABELS[value]}</option>
              ))}
            </select>
          </label>
          <label className="mc-slot grid gap-1 p-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/45 focus-within:!border-[var(--accent)]">
            Coverage
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as SourceCoverageStatus | "")}
              className="bg-[#303030] px-2 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none"
            >
              <option value="">All statuses</option>
              {(Object.keys(STATUS_LABELS) as SourceCoverageStatus[]).map((value) => (
                <option key={value} value={value}>{STATUS_LABELS[value]}</option>
              ))}
            </select>
          </label>
        </section>

        <div className="pixel-font mt-4 flex items-center justify-between text-base uppercase leading-none tracking-wide text-[var(--color-faint)]">
          <span>{visible.length} source groups</span>
          {(courseId || status || kind || query) && (
            <button
              type="button"
              className="arcade-focus-ring font-semibold text-[var(--accent)] hover:underline"
              onClick={() => { setCourseId(""); setStatus(""); setKind(""); setQuery(""); }}
            >
              Clear filters
            </button>
          )}
        </div>

        <section className="mt-3 grid gap-3">
          {visible.map((group) => (
            <article key={group.key} className="mc-panel arcade-dark relative overflow-hidden p-4 text-white sm:p-5">
              <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.02]" />
              <div className="relative">
              <div className="flex flex-wrap items-start gap-3">
                <span
                  className="mc-slot grid h-10 w-10 shrink-0 place-items-center"
                  style={{ background: `${group.accent}20`, color: group.accent }}
                >
                  <Icon name={group.kind === "uncited" ? "AlertTriangle" : "FileCheck"} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="pixel-font text-xl uppercase leading-none">{group.label}</h2>
                    <Pill tone={group.status === "mapped" ? "good" : "warn"} className="!px-2 !py-0.5 !text-[10px]">
                      {STATUS_LABELS[group.status]}
                    </Pill>
                    <Pill tone="neutral" className="!px-2 !py-0.5 !text-[10px]">
                      {KIND_LABELS[group.kind]}
                    </Pill>
                  </div>
                  <div className="mt-1 text-xs font-semibold" style={{ color: group.accent }}>
                    {group.courseShort} · {group.questionCount} question{group.questionCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              {group.sources.length > 0 && (
                <details className="mc-slot mt-3 p-3 text-xs text-white/45">
                  <summary className="cursor-pointer font-semibold">{group.sources.length} exact citation{group.sources.length === 1 ? "" : "s"}</summary>
                  <ul className="mt-2 grid gap-1 pl-4">
                    {group.sources.slice(0, 12).map((source) => <li key={source}>{source}</li>)}
                    {group.sources.length > 12 && <li>+{group.sources.length - 12} more</li>}
                  </ul>
                </details>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="pixel-font mb-1.5 text-base uppercase leading-none tracking-wider text-white/45">Practice coverage</div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.practiceLinks.slice(0, 5).map((link) => (
                      <Link key={link.href} to={link.href} className="mc-slot arcade-focus-ring px-2.5 py-1.5 text-xs font-semibold text-white/80 transition hover:!border-[var(--accent)] hover:text-white">
                        {link.label} <Icon name="ArrowRight" size={11} className="ml-1 inline" />
                      </Link>
                    ))}
                    {group.practiceLinks.length === 0 && <span className="text-xs text-white/35">No topic links</span>}
                    {group.practiceLinks.length > 5 && <span className="self-center text-xs text-white/35">+{group.practiceLinks.length - 5} topics</span>}
                  </div>
                </div>
                <div>
                  <div className="pixel-font mb-1.5 text-base uppercase leading-none tracking-wider text-white/45">Related lessons</div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.lessonLinks.slice(0, 5).map((link) => (
                      <Link key={link.href} to={link.href} className="mc-slot arcade-focus-ring px-2.5 py-1.5 text-xs font-semibold text-white/80 transition hover:!border-[var(--accent)] hover:text-white">
                        {link.label} <Icon name="BookOpen" size={11} className="ml-1 inline" />
                      </Link>
                    ))}
                    {group.lessonLinks.length === 0 && <span className="text-xs text-white/35">No confident lesson match</span>}
                    {group.lessonLinks.length > 5 && <span className="self-center text-xs text-white/35">+{group.lessonLinks.length - 5} lessons</span>}
                  </div>
                </div>
              </div>
              </div>
            </article>
          ))}
        </section>

        {visible.length === 0 && ready && (
          <div className="mc-panel arcade-dark mt-3 p-8 text-center text-white">
            <span className="pixel-font text-xl uppercase leading-none text-white/55">No source groups match these filters.</span>
          </div>
        )}
      </Page>
    </>
  );
}
