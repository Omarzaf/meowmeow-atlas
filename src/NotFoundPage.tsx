import { ArrowLeft, Compass, ImageSquare, MagnifyingGlass } from "@phosphor-icons/react";
import { withBase } from "./routing";

/**
 * Served with a real 404 status by the worker. Citation URLs rot, so a mistyped
 * or dead link has to look dead rather than silently resolving to the homepage.
 */
export function NotFoundPage() {
  return (
    <div className="atlas-shell notfound-shell">
      <main className="notfound-content">
        <p className="notfound-code">404</p>
        <h1>This address is not part of the atlas</h1>
        <p className="notfound-lede">
          The page may have been renamed, or the link that brought you here may have been
          truncated. Nothing has been removed from the research record.
        </p>

        <nav aria-label="Atlas sections" className="notfound-links">
          <a href={withBase("/")}>
            <Compass aria-hidden="true" size={19} />
            <span>
              <strong>Research atlas</strong>
              Cases, sources, and verification notes
            </span>
          </a>
          <a href={withBase("/visual-archive")}>
            <ImageSquare aria-hidden="true" size={19} />
            <span>
              <strong>Visual archive</strong>
              Rights-cleared protest photographs
            </span>
          </a>
        </nav>

        <p className="notfound-hint">
          <MagnifyingGlass aria-hidden="true" size={16} />
          Looking for a specific source? The atlas search covers every title, publisher, right,
          method, and case in the corpus.
        </p>

        <a className="notfound-back" href={withBase("/")}>
          <ArrowLeft aria-hidden="true" size={15} weight="bold" />
          Return to the atlas
        </a>
      </main>
    </div>
  );
}
