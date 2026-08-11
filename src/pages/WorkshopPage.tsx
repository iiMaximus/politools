import { Link } from "react-router-dom";
import { useCloud } from "../components/CloudProvider";
import { Icon } from "../components/Icon";
import { Page, TopBar } from "../components/Layout";
import { useAllCourses } from "../courses/registry";
import { useGame } from "../lib/game";
import { aggregate, summarizeFromStorage } from "../lib/summary";

interface InventorySlot {
  label: string;
  value: number;
  icon: string;
  color: string;
  hint: string;
}

interface Recipe {
  name: string;
  desc: string;
  icon: string;
  to: string;
  ready: boolean;
  requirement: string;
  action: string;
}

/** A deliberately lightweight inventory: the numbers are real learning
 *  evidence, not another currency to farm or manage. Recipes never consume it;
 *  they turn the evidence into the right next study activity. */
export function WorkshopPage() {
  const { courses } = useAllCourses();
  const game = useGame();
  const cloud = useCloud();
  const overall = aggregate(courses.map(summarizeFromStorage));
  const focus = game.settings.focusCourses
    .map((id) => courses.find((course) => course.meta.id === id))
    .filter(Boolean);
  const mockCourse = focus.find((course) => summarizeFromStorage(course!).started) ?? focus[0];

  const inventory: InventorySlot[] = [
    {
      label: "Field notes",
      value: overall.lessonsDone,
      icon: "ScrollText",
      color: "#ffd45e",
      hint: "Lessons cleared",
    },
    {
      label: "Memory crystal",
      value: overall.mastered,
      icon: "Gem",
      color: "#c98bff",
      hint: "Cards truly mastered",
    },
    {
      label: "Error scrap",
      value: overall.mistakes,
      icon: "Cog",
      color: "#ff8f8f",
      hint: "Open mistakes to repair",
    },
    {
      label: "Recall sparks",
      value: overall.due,
      icon: "Zap",
      color: "#7fdc39",
      hint: "Reviews ready now",
    },
    {
      label: "Boss cores",
      value: game.totals.bossWins,
      icon: "Swords",
      color: "#66c7ff",
      hint: "Final bosses defeated",
    },
  ];

  const hasReachedContent = overall.lessonsDone > 0 || overall.mastered > 0;
  const recipes: Recipe[] = [
    {
      name: "Repair kit",
      desc: "Rebuild the concepts behind your open mistakes, then prove the repair with spaced recall.",
      icon: "Hammer",
      to: "/mistakes",
      ready: overall.mistakes > 0,
      requirement: overall.mistakes > 0 ? `${overall.mistakes} error scrap ready` : "No open mistakes",
      action: "Repair mistakes",
    },
    {
      name: "Recall compass",
      desc: "Assemble a mix from reached topics, prioritising due, weak and recently missed material.",
      icon: "Compass",
      to: "/mix",
      ready: hasReachedContent,
      requirement: overall.due > 0 ? `${overall.due} recall sparks waiting` : "Uses reached lessons",
      action: "Build a mix",
    },
    {
      name: "Exam scanner",
      desc: "Combine mastery, mistakes, lessons and mock evidence into the clearest next battle action.",
      icon: "Target",
      to: "/readiness",
      ready: true,
      requirement: `${overall.coursesStarted} course${overall.coursesStarted === 1 ? "" : "s"} explored`,
      action: "Scan readiness",
    },
    {
      name: "Mock cartridge",
      desc: "Load the most relevant focus course into a timed exam run when you have some material to test.",
      icon: "Gamepad2",
      to: mockCourse ? `/c/${mockCourse.meta.id}/mock` : "/",
      ready: Boolean(mockCourse && hasReachedContent),
      requirement: mockCourse ? `Target: ${mockCourse.meta.short}` : "Choose a focus course first",
      action: "Load mock",
    },
  ];

  const activeCrew = cloud.profiles.filter(
    (profile) => profile.weekly_activity > 0 || profile.weekly_xp > 0
  );
  const crewSize = Math.max(1, activeCrew.length);
  const crewXp = activeCrew.reduce((sum, profile) => sum + profile.weekly_xp, 0);
  const crewGoal = crewSize * 250;
  const crewPct = Math.min(100, Math.round((crewXp / crewGoal) * 100));

  return (
    <>
      <TopBar crumbs={[{ label: "Workshop" }]} />
      <Page className="max-w-5xl">
        <section className="mc-panel arcade-dark relative overflow-hidden p-5 text-white sm:p-7">
          <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.045]" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="pixel-font text-base uppercase tracking-[0.28em] text-white/45">
                Player workshop
              </div>
              <h1 className="pixel-font mt-1 text-4xl uppercase leading-none text-white sm:text-5xl">
                Knowledge inventory
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
                Your inventory is made from real study evidence. Recipes do not consume it or hide
                lessons—they simply assemble the right next activity.
              </p>
            </div>
            <Link to="/" className="arcade-button arcade-button-secondary px-4">
              <Icon name="Home" size={15} /> Back to base
            </Link>
          </div>
        </section>

        <section className="mt-5" aria-labelledby="inventory-title">
          <h2 id="inventory-title" className="pixel-font text-3xl uppercase leading-none">
            Backpack
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {inventory.map((item) => (
              <article key={item.label} className="mc-panel arcade-dark p-3 text-white">
                <div className="mc-slot relative grid aspect-square place-items-center">
                  <Icon name={item.icon} size={30} style={{ color: item.color }} />
                  <span
                    className="pixel-font absolute bottom-1 right-2 text-3xl leading-none text-white"
                    style={{ textShadow: "2px 2px 0 #000" }}
                  >
                    {item.value}
                  </span>
                </div>
                <h3 className="pixel-font mt-2 text-xl uppercase leading-none">{item.label}</h3>
                <p className="mt-1 text-[10px] leading-snug text-white/40">{item.hint}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="recipes-title">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="pixel-font text-base uppercase tracking-[0.24em] text-[var(--accent)]">
                Useful recipes
              </div>
              <h2 id="recipes-title" className="pixel-font text-4xl uppercase leading-none">
                Craft a study run
              </h2>
            </div>
            <span className="text-xs text-[var(--color-faint)]">Reusable · nothing is consumed</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {recipes.map((recipe) => (
              <article key={recipe.name} className="mc-panel arcade-dark relative overflow-hidden p-4 text-white sm:p-5">
                <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.035]" />
                <div className="relative flex gap-3">
                  <span className="mc-slot grid h-12 w-12 shrink-0 place-items-center text-[var(--accent)]">
                    <Icon name={recipe.icon} size={23} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="pixel-font text-2xl uppercase leading-none">{recipe.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">{recipe.desc}</p>
                  </div>
                </div>
                <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <span className="pixel-font text-lg leading-none text-[#ffd45e]">{recipe.requirement}</span>
                  {recipe.ready ? (
                    <Link to={recipe.to} className="arcade-button px-3">
                      <Icon name="Hammer" size={14} /> {recipe.action}
                    </Link>
                  ) : (
                    <span className="mc-slot pixel-font px-3 py-2 text-lg uppercase leading-none text-white/30">
                      Recipe sleeping
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mc-panel arcade-dark relative mt-8 overflow-hidden p-5 text-white">
          <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.04]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="mc-slot grid h-14 w-14 shrink-0 place-items-center text-[#7fdc39]">
              <Icon name="Blocks" size={27} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="pixel-font text-base uppercase tracking-[0.24em] text-white/45">Crew project</div>
              <h2 className="pixel-font text-3xl uppercase leading-none">Build the weekly study beacon</h2>
              <p className="mt-1 text-xs text-white/45">
                {crewSize === 1 ? "Solo build" : `${crewSize}-player build`} · the target automatically scales
                with whoever is active this week.
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-sm border-2 border-black bg-[#111]">
                <div
                  className="h-full bg-gradient-to-r from-[#39a852] to-[#7fdc39] transition-all"
                  style={{ width: `${crewPct}%` }}
                />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="pixel-font text-3xl leading-none text-[#7fdc39]">{crewPct}%</div>
              <div className="pixel-font text-base leading-none text-white/45">
                {crewXp}/{crewGoal} XP
              </div>
            </div>
          </div>
        </section>
      </Page>
    </>
  );
}
