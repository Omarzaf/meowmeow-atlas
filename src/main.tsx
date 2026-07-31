import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import routes from "./data/routes.json";
import { stripBase, withBase } from "./routing";
import "./styles.css";

const normalizedPath = stripBase(window.location.pathname);
const route = routes.find((entry) => entry.path === normalizedPath);

/**
 * The build emits a prerendered HTML shell per route with the correct head
 * tags, so in production this is a no-op. It keeps `pnpm dev` — which serves a
 * single index.html for every path — consistent with what ships.
 */
function applyRouteMetadata(): void {
  const active = route ?? routes.find((entry) => entry.path === "/404");
  if (!active) return;

  document.title = active.title;

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", active.description);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute(
      "href",
      new URL(withBase(active.path), window.location.origin).toString(),
    );
  }
}

applyRouteMetadata();

function renderPage(page: ReactNode) {
  createRoot(document.getElementById("root")!).render(<StrictMode>{page}</StrictMode>);
}

if (normalizedPath === "/visual-archive") {
  void import("./VisualArchivePage").then(({ VisualArchivePage }) => {
    renderPage(<VisualArchivePage />);
  });
} else if (normalizedPath === "/") {
  void import("./App").then(({ App }) => {
    renderPage(<App />);
  });
} else {
  void import("./NotFoundPage").then(({ NotFoundPage }) => {
    renderPage(<NotFoundPage />);
  });
}
