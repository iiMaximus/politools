import { Link } from "react-router-dom";
import { TopBar, Page } from "../components/Layout";
import { Icon } from "../components/Icon";

export function NotFound() {
  return (
    <>
      <TopBar />
      <Page className="max-w-xl">
        <div className="surface mt-16 p-10 text-center">
          <Icon name="Compass" size={40} className="mx-auto mb-4 text-[var(--accent)]" />
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="mt-2 text-[var(--color-muted)]">This route doesn't exist yet.</p>
          <Link to="/" className="btn btn-primary mt-6 inline-flex">
            <Icon name="Home" size={16} /> Back to hub
          </Link>
        </div>
      </Page>
    </>
  );
}
