import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Page, TopBar } from "../components/Layout";
import { Kicker, Pill } from "../components/ui";
import { auditContent, type QaCode, type QaSeverity } from "../lib/content-qa";
import { useContentCourses } from "../lib/content-index";

const CODE_LABELS: Record<QaCode, string> = {
  "duplicate-id": "Duplicate IDs",
  "missing-source": "Missing sources",
  "broken-topic": "Broken topics",
  "missing-topic": "Missing topics",
  "option-count": "Option counts",
  "duplicate-option": "Duplicate options",
  "invalid-correct-option": "Invalid answers",
  "empty-option": "Empty options",
  "thin-explanation": "Thin explanations",
  "missing-theory": "Missing theory",
  "coverage-gap": "Lesson coverage",
  "syllabus-gap": "Syllabus coverage",
  "incomplete-exam": "Incomplete exams",
};

const SEVERITY_META: Record<QaSeverity, { label: string; icon: string; color: string; background: string }> = {
  error: { label: "Error", icon: "CircleX", color: "var(--bad)", background: "var(--bad-bg)" },
  warning: { label: "Warning", icon: "AlertTriangle", color: "var(--warn)", background: "var(--warn-bg)" },
  info: { label: "Info", icon: "Info", color: "var(--accent)", background: "var(--color-surface-2)" },
};

const INITIAL_LIMIT = 250;

export function ContentQaPage() {
  const { courses, ready } = useContentCourses();
  const report = useMemo(() => auditContent(courses), [courses]);
  const [severity, setSeverity] = useState<QaSeverity | "">("");
  const [code, setCode] = useState<QaCode | "">("");
  const [courseId, setCourseId] = useState("");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return report.issues.filter((issue) => {
      if (severity && issue.severity !== severity) return false;
      if (code && issue.code !== code) return false;
      if (courseId && issue.courseId !== courseId) return false;
      if (!needle) return true;
      return `${issue.title} ${issue.detail} ${issue.entityId} ${issue.courseTitle}`
        .toLowerCase()
        .includes(needle);
    });
  }, [code, courseId, query, report.issues, severity]);
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_LIMIT);
  const sourceRate = report.summary.questions
    ? Math.round((report.summary.citedQuestions / report.summary.questions) * 100)
    : 0;

  return (
    <>
      <TopBar crumbs={[{ label: "Content QA" }]} />
      <Page className="max-w-5xl pt-5 sm:pt-8">
        <section className="mc-panel arcade-dark relative overflow-hidden p-5 text-white sm:p-7">
          <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.04]" />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <Kicker className="!text-[var(--accent)]">Internal verifier</Kicker>
            <h1 className="pixel-font mt-2 text-4xl uppercase leading-none tracking-wide sm:text-5xl">Content QA</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Structural checks for IDs, topic references, citations, distractors, explanations,
              exam solutions, and lesson-to-practice coverage.
            </p>
          </div>
          <Pill tone={ready ? "good" : "neutral"}>
            <Icon name={ready ? "CheckCheck" : "Hourglass"} size={13} />
            {ready ? `${report.summary.courses} courses scanned` : "Scanning lazy course chunks"}
          </Pill>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label="Errors" value={report.summary.errors} severity="error" />
          <SummaryCard label="Warnings" value={report.summary.warnings} severity="warning" />
          <SummaryCard label="Info" value={report.summary.info} severity="info" />
          <div className="mc-panel arcade-dark p-4 text-white">
            <div className="pixel-font text-3xl leading-none text-[var(--accent)]">{sourceRate}%</div>
            <div className="pixel-font mt-1 text-base uppercase leading-none text-white/45">questions cited</div>
          </div>
        </section>

        <section className="mc-panel arcade-dark mt-4 p-4 text-white">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="mc-slot grid gap-1 p-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Find issue
              <input
                value={query}
                onChange={(event) => { setQuery(event.target.value); setShowAll(false); }}
                placeholder="ID, title, detail…"
                className="bg-[#303030] px-2 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/25"
              />
            </label>
            <label className="mc-slot grid gap-1 p-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Severity
              <select
                value={severity}
                onChange={(event) => { setSeverity(event.target.value as QaSeverity | ""); setShowAll(false); }}
                className="bg-[#303030] px-2 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none"
              >
                <option value="">All severities</option>
                {(Object.keys(SEVERITY_META) as QaSeverity[]).map((value) => (
                  <option key={value} value={value}>{SEVERITY_META[value].label}</option>
                ))}
              </select>
            </label>
            <label className="mc-slot grid gap-1 p-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Check
              <select
                value={code}
                onChange={(event) => { setCode(event.target.value as QaCode | ""); setShowAll(false); }}
                className="bg-[#303030] px-2 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none"
              >
                <option value="">Every check</option>
                {(Object.keys(CODE_LABELS) as QaCode[]).map((value) => (
                  <option key={value} value={value}>{CODE_LABELS[value]}</option>
                ))}
              </select>
            </label>
            <label className="mc-slot grid gap-1 p-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Course
              <select
                value={courseId}
                onChange={(event) => { setCourseId(event.target.value); setShowAll(false); }}
                className="bg-[#303030] px-2 py-2 text-sm font-normal normal-case tracking-normal text-white outline-none"
              >
                <option value="">All courses</option>
                {courses.map((course) => (
                  <option key={course.meta.id} value={course.meta.id}>{course.meta.title}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="pixel-font mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm uppercase leading-none text-white/40">
            <span>{report.summary.lessons} lessons</span>
            <span>{report.summary.questions} questions</span>
            <span>{report.summary.exams} exams</span>
            <span className="ml-auto font-semibold">{filtered.length} matching issues</span>
          </div>
        </section>

        <section className="mt-4 grid gap-2.5" aria-live="polite">
          {visible.map((issue) => {
            const meta = SEVERITY_META[issue.severity];
            return (
              <article key={issue.key} className="mc-panel arcade-dark relative flex gap-3 overflow-hidden p-4 text-white sm:p-5">
                <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.02]" />
                <span
                  className="mc-slot relative mt-0.5 grid h-9 w-9 shrink-0 place-items-center"
                  style={{ color: meta.color, background: meta.background }}
                >
                  <Icon name={meta.icon} size={17} />
                </span>
                <div className="relative min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="pixel-font text-xl uppercase leading-none">{issue.title}</h2>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: meta.color, background: meta.background }}>
                      {meta.label}
                    </span>
                    <Pill tone="neutral" className="!px-2 !py-0.5 !text-[10px]">
                      {CODE_LABELS[issue.code]}
                    </Pill>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[var(--accent)]">
                    {issue.courseTitle} · {issue.entityType} {issue.entityId}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">{issue.detail}</p>
                </div>
                <Link
                  to={issue.href}
                  className="mc-slot relative mt-1 grid h-9 w-9 shrink-0 place-items-center text-white/40 hover:text-[var(--accent)]"
                  title="Open affected content"
                >
                  <Icon name="ExternalLink" size={15} />
                </Link>
              </article>
            );
          })}
        </section>

        {!showAll && filtered.length > INITIAL_LIMIT && (
          <button
            type="button"
            className="btn btn-ghost mx-auto mt-4 flex"
            onClick={() => setShowAll(true)}
          >
            Show all {filtered.length.toLocaleString()} issues
          </button>
        )}

        {filtered.length === 0 && ready && (
          <div className="mc-panel arcade-dark mt-4 p-8 text-center text-white">
            <Icon name="ShieldCheck" size={28} className="mx-auto text-[var(--good)]" />
            <h2 className="pixel-font mt-3 text-2xl uppercase leading-none">No issues in this view</h2>
            <p className="mt-2 text-sm text-white/55">The active filters are clean.</p>
          </div>
        )}
      </Page>
    </>
  );
}

function SummaryCard({
  label,
  value,
  severity,
}: {
  label: string;
  value: number;
  severity: QaSeverity;
}) {
  const meta = SEVERITY_META[severity];
  return (
    <div className="mc-panel arcade-dark p-4 text-white">
      <div className="flex items-center gap-2">
        <Icon name={meta.icon} size={16} style={{ color: meta.color }} />
        <span className="pixel-font text-3xl leading-none">{value}</span>
      </div>
      <div className="pixel-font mt-1 text-base uppercase leading-none text-white/45">{label}</div>
    </div>
  );
}
