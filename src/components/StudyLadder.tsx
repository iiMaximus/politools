import { Link } from "react-router-dom";
import type { StudyLadder as StudyLadderModel } from "../lib/study-ladder";
import { Icon } from "./Icon";
import { Kicker } from "./ui";

export function StudyLadder({ ladder }: { ladder: StudyLadderModel }) {
  return (
    <section className="mc-panel arcade-dark relative mt-4 overflow-hidden p-5 text-white">
      <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div className="relative flex flex-wrap items-start justify-between gap-2">
        <div>
          <Kicker className="!text-white/45">Learning ladder</Kicker>
          <h2 className="pixel-font mt-1 text-2xl uppercase leading-none">{ladder.sectionTitle}</h2>
          <p className="mt-2 text-xs text-white/45">
            Understand it, see it solved, try it with support, then prove it alone and under time.
          </p>
        </div>
        <span className="pixel-font text-xl leading-none text-[var(--accent)]">
          {ladder.completed}/{ladder.total} CLEARED
        </span>
      </div>

      <div className="relative mt-4 grid gap-2 sm:grid-cols-5">
        {ladder.steps.map((step, index) => (
          <Link
            key={step.id}
            to={step.to}
            className="mc-slot card-hover relative p-3"
            style={{
              borderColor: step.state === "now" ? "var(--accent)" : undefined,
              boxShadow: step.state === "now" ? "inset 0 0 0 1px var(--accent), 0 0 14px var(--accent-soft)" : undefined,
              opacity: step.state === "next" ? 0.72 : 1,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{
                  background: step.done ? "var(--good-bg)" : step.state === "now" ? "var(--accent-soft)" : "#242424",
                  color: step.done ? "var(--good)" : step.state === "now" ? "var(--accent)" : "var(--color-faint)",
                }}
              >
                <Icon name={step.done ? "Check" : step.icon} size={16} />
              </span>
              <span className="pixel-font text-base leading-none text-white/35">0{index + 1}</span>
            </div>
            <div className="mt-2 text-sm font-bold">{step.label}</div>
            <div className="mt-0.5 text-[11px] leading-snug text-white/40">{step.detail}</div>
            {step.state === "now" && (
              <div className="pixel-font mt-2 flex items-center gap-1 text-base leading-none text-[var(--accent)]">
                PLAY NEXT <Icon name="ArrowRight" size={12} />
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
