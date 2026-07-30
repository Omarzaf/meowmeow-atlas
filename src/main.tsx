import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const isVisualArchive = normalizedPath === "/visual-archive";

document.title = isVisualArchive
  ? "Visual archive — meowmeow"
  : "meowmeow — Gen Z Protest Atlas";

function renderPage(page: ReactNode) {
  createRoot(document.getElementById("root")!).render(<StrictMode>{page}</StrictMode>);
}

if (isVisualArchive) {
  void import("./VisualArchivePage").then(({ VisualArchivePage }) => {
    renderPage(<VisualArchivePage />);
  });
} else {
  void import("./App").then(({ App }) => {
    renderPage(<App />);
  });
}
