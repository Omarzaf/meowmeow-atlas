import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  Camera,
  Cat,
  CheckCircle,
  GlobeHemisphereWest,
  House,
  ImageSquare,
  Info,
  MapPin,
  Scales,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";
import imageWidths from "./data/image-widths.json";
import {
  featuredVisualRecord,
  supportingVisualRecords,
  visualArchive,
  visualArchiveCaseCount,
  visualArchiveRecords,
  type VisualArchiveRecord,
} from "./visualArchiveData";

function formatDate(value: string | null): string {
  if (!value) return "Date not asserted";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

/**
 * Builds a srcset from the derivatives emitted by `scripts/build-images.mjs`.
 * The archival original is kept as the final candidate and as the `src`
 * fallback, so a browser without srcset support still gets a working image and
 * the digest-attested file stays reachable.
 */
function derivativeSrcSet(record: VisualArchiveRecord, extension: "webp" | "jpg"): string {
  const widths = (imageWidths as number[]).filter((width) => width < record.image.width);
  const candidates = widths.map(
    (width) => `/visual-archive/derived/${record.id}-${width}.${extension} ${width}w`,
  );

  if (extension === "jpg") {
    candidates.push(`${record.image.src} ${record.image.width}w`);
  }

  return candidates.join(", ");
}

function ArchiveImage({
  record,
  featured = false,
}: {
  record: VisualArchiveRecord;
  featured?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-label={`${record.image.alt} The local image could not be loaded.`}
        className="archive-image-fallback"
        role="img"
      >
        <ImageSquare aria-hidden="true" size={38} weight="light" />
        <span>Image unavailable. The verified context and source record remain below.</span>
      </div>
    );
  }

  const sizes = featured ? "(max-width: 900px) 100vw, 55vw" : "(max-width: 900px) 100vw, 30vw";

  return (
    <picture>
      <source sizes={sizes} srcSet={derivativeSrcSet(record, "webp")} type="image/webp" />
      <img
        alt={record.image.alt}
        decoding="async"
        fetchPriority={featured ? "high" : "auto"}
        height={record.image.height}
        loading={featured ? "eager" : "lazy"}
        onError={() => setFailed(true)}
        sizes={sizes}
        src={record.image.src}
        srcSet={derivativeSrcSet(record, "jpg")}
        width={record.image.width}
      />
    </picture>
  );
}

function ImageCredit({ record }: { record: VisualArchiveRecord }) {
  const photographer = record.image.photographer_url ? (
    <a href={record.image.photographer_url} rel="noreferrer" target="_blank">
      {record.image.photographer}
    </a>
  ) : (
    record.image.photographer
  );

  return (
    <p className="archive-credit">
      Photo: {photographer}.{" "}
      <a href={record.image.origin_url} rel="noreferrer" target="_blank">
        Source record
        <ArrowSquareOut aria-hidden="true" size={12} />
      </a>{" "}
      ·{" "}
      <a href={record.image.license_url} rel="noreferrer" target="_blank">
        {record.image.license_code}
      </a>
    </p>
  );
}

function ContextSources({ record }: { record: VisualArchiveRecord }) {
  return (
    <div className="archive-sources">
      <h3>Context sources</h3>
      <ul>
        {record.context_sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} rel="noreferrer" target="_blank">
              <span>{source.publisher}</span>
              {source.title}
              <ArrowSquareOut aria-hidden="true" size={13} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecordDetails({ record }: { record: VisualArchiveRecord }) {
  return (
    <details className="archive-details">
      <summary>
        <ShieldCheck aria-hidden="true" size={17} weight="bold" />
        Verification, rights & safety
      </summary>
      <div className="archive-details-grid">
        <div>
          <h3>Verification boundary</h3>
          <p>{record.verification_note}</p>
          <p>{record.manipulation_note}</p>
        </div>
        <div>
          <h3>Reuse terms</h3>
          <p>{record.image.rights_note}</p>
          <p>{record.image.transformation_note}</p>
        </div>
        <div>
          <h3>Safety boundary</h3>
          <p>{record.safety_note}</p>
        </div>
      </div>
    </details>
  );
}

function ArchiveCard({ record }: { record: VisualArchiveRecord }) {
  return (
    <article className="archive-card">
      <figure>
        <div className="archive-card-image">
          <ArchiveImage record={record} />
          <span
            className={
              record.display_tag === "International solidarity"
                ? "archive-badge archive-badge--solidarity"
                : "archive-badge"
            }
          >
            {record.display_tag}
          </span>
        </div>
        <figcaption>
          {record.image.caption}
          <ImageCredit record={record} />
        </figcaption>
      </figure>

      <div className="archive-card-body">
        <p className="archive-location">
          <MapPin aria-hidden="true" size={16} weight="fill" />
          {record.location} · {formatDate(record.protest_date)}
        </p>
        <h2>{record.title}</h2>
        <p className="archive-location-note">{record.location_note}</p>

        <div className="archive-explanation">
          <div>
            <h3>What this shows</h3>
            <p>{record.what_this_shows}</p>
          </div>
          <div>
            <h3>Why it matters</h3>
            <p>{record.why_it_matters}</p>
          </div>
        </div>

        <a className="archive-case-link" href={`/?case=${record.related_case_id}#cases`}>
          Open related case: {record.related_case_label}
          <ArrowRight aria-hidden="true" size={15} weight="bold" />
        </a>
        <ContextSources record={record} />
        <RecordDetails record={record} />
      </div>
    </article>
  );
}

export function VisualArchivePage() {
  return (
    <div className="atlas-shell visual-archive-shell">
      <header className="site-header">
        <a className="wordmark" href="/">
          <span>meowmeow</span>
          <Cat aria-hidden="true" className="wordmark-cat" size={22} weight="fill" />
        </a>
        <span className="header-rule" aria-hidden="true" />
        <p>
          <span className="header-product-label">Visual archive</span>{" "}
          Rights-cleared photographs with protest context, provenance, and safety limits.
        </p>
        <time dateTime={visualArchive.last_checked}>
          Checked <strong>{formatDate(visualArchive.last_checked)}</strong>
        </time>
      </header>

      <div className="atlas-layout visual-archive-layout">
        <aside className="taxonomy visual-taxonomy">
          <p className="taxonomy-heading">Explore meowmeow</p>
          <nav aria-label="Explore meowmeow">
            <a className="taxonomy-link" href="/">
              <House aria-hidden="true" size={19} />
              <span>Research atlas</span>
            </a>
            <a
              aria-current="page"
              className="taxonomy-link taxonomy-link--active"
              href="/visual-archive"
            >
              <ImageSquare aria-hidden="true" size={19} weight="fill" />
              <span>Visual archive</span>
            </a>
            <a className="taxonomy-link" href="#method">
              <ShieldCheck aria-hidden="true" size={19} />
              <span>Method & rights</span>
            </a>
          </nav>
        </aside>

        <main className="atlas-content visual-archive-content">
          <section className="archive-hero" aria-labelledby="visual-archive-title">
            <p className="archive-kicker">
              <Camera aria-hidden="true" size={17} weight="bold" />
              A photographic companion to the case atlas
            </p>
            <h1 id="visual-archive-title">Visual archive</h1>
            <p className="archive-deck">
              {visualArchive.scope_note} Each record keeps the original credit and reuse terms
              beside two independent context sources, an image-integrity note, and a participant
              safety boundary.
            </p>
            <dl className="archive-stats" aria-label="Archive scope">
              <div>
                <dt>Photographs</dt>
                <dd>{visualArchiveRecords.length}</dd>
              </div>
              <div>
                <dt>Movements</dt>
                <dd>{visualArchiveCaseCount}</dd>
              </div>
              <div>
                <dt>Remote hotlinks</dt>
                <dd>None</dd>
              </div>
              <div>
                <dt>Graphic imagery</dt>
                <dd>Excluded</dd>
              </div>
            </dl>
          </section>

          <section className="archive-feature" aria-labelledby="featured-image-heading">
            <figure className="archive-feature-figure">
              <ArchiveImage featured record={featuredVisualRecord} />
              <figcaption>
                {featuredVisualRecord.image.caption}
                <ImageCredit record={featuredVisualRecord} />
              </figcaption>
            </figure>

            <div className="archive-feature-copy">
              <p className="archive-record-index">Featured record · 01</p>
              <span className="archive-badge">{featuredVisualRecord.display_tag}</span>
              <h2 id="featured-image-heading">{featuredVisualRecord.title}</h2>
              <p className="archive-location">
                <MapPin aria-hidden="true" size={16} weight="fill" />
                {featuredVisualRecord.location} ·{" "}
                {formatDate(featuredVisualRecord.protest_date)}
              </p>
              <p className="archive-location-note">{featuredVisualRecord.location_note}</p>

              <div className="archive-explanation">
                <div>
                  <h3>What this shows</h3>
                  <p>{featuredVisualRecord.what_this_shows}</p>
                </div>
                <div>
                  <h3>Why it matters</h3>
                  <p>{featuredVisualRecord.why_it_matters}</p>
                </div>
              </div>

              <a
                className="archive-case-link"
                href={`/?case=${featuredVisualRecord.related_case_id}#cases`}
              >
                Open related case: {featuredVisualRecord.related_case_label}
                <ArrowRight aria-hidden="true" size={15} weight="bold" />
              </a>
              <ContextSources record={featuredVisualRecord} />
              <RecordDetails record={featuredVisualRecord} />
            </div>
          </section>

          <section className="archive-index" id="archive" aria-labelledby="archive-index-heading">
            <div className="archive-section-heading">
              <div>
                <p className="archive-kicker">
                  <GlobeHemisphereWest aria-hidden="true" size={17} weight="bold" />
                  {supportingVisualRecords.length} more{" "}
                  {supportingVisualRecords.length === 1 ? "record" : "records"}
                </p>
                <h2 id="archive-index-heading">Scenes, symbols, and sites</h2>
              </div>
              <p>
                Direct records and transnational solidarity are labelled separately to prevent
                geographic conflation.
              </p>
            </div>

            <div className="archive-grid">
              {supportingVisualRecords.map((record) => (
                <ArchiveCard key={record.id} record={record} />
              ))}
            </div>
          </section>

          <section className="archive-method" id="method" aria-labelledby="archive-method-heading">
            <p className="archive-kicker">
              <ShieldCheck aria-hidden="true" size={17} weight="bold" />
              Method, rights, and limits
            </p>
            <h2 id="archive-method-heading">How to read this archive</h2>

            <div className="archive-method-grid">
              <article>
                <CheckCircle aria-hidden="true" size={22} weight="fill" />
                <h3>Selection</h3>
                <p>
                  Photographs were selected for documentary specificity, public-event context,
                  non-graphic content, and a verifiable reuse license—not presumed fame or
                  universal symbolic status.
                </p>
              </article>
              <article>
                <Scales aria-hidden="true" size={22} weight="fill" />
                <h3>Rights</h3>
                <p>
                  Every image is served locally from a Wikimedia Commons record carrying CC0 or a
                  Creative Commons license. Credits, license links, change notes, and ShareAlike
                  obligations remain attached to each record.
                </p>
              </article>
              <article>
                <Info aria-hidden="true" size={22} weight="fill" />
                <h3>Verification</h3>
                <p>
                  Source metadata and protest chronology were reviewed; two distinct publishers
                  support each context note. No entry is presented as a completed forensic
                  authentication.
                </p>
              </article>
              <article>
                <WarningCircle aria-hidden="true" size={22} weight="fill" />
                <h3>Participant safety</h3>
                <p>
                  These are public-event photographs, but visibility is not consent to profiling.
                  The archive does not name participants, infer identities, or provide
                  face-recognition assistance.
                </p>
              </article>
            </div>

            <a className="archive-back-link" href="/">
              <ArrowLeft aria-hidden="true" size={15} weight="bold" />
              Return to the research atlas
            </a>
          </section>
        </main>
      </div>
    </div>
  );
}
