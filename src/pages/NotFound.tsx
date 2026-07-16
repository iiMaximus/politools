import { Link } from "react-router-dom";
import { TopBar, Page } from "../components/Layout";

export function NotFound() {
  return (
    <>
      <TopBar />
      <Page className="max-w-xl">
        <div className="mc-panel relative mt-16 overflow-hidden p-10 text-center text-white">
          <div className="crt-lines pointer-events-none absolute inset-0 opacity-[0.06]" />
          <div className="pixel-font relative text-6xl uppercase leading-none" style={{ color: "#ff5555", textShadow: "3px 3px 0 #000" }}>
            Game over
          </div>
          <p className="pixel-font relative mt-3 text-xl text-white/60">404 — this route does not exist</p>
          <Link to="/" className="btn btn-primary relative mt-6 inline-flex">
            <span className="arcade-blink">▶</span>
            <span className="pixel-font text-xl uppercase leading-none">Continue?</span>
          </Link>
        </div>
      </Page>
    </>
  );
}
