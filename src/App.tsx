import { Fragment, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowSquareOut,
  Binoculars,
  Books,
  Brain,
  Cat,
  CaretDown,
  Compass,
  FlagBanner,
  FunnelSimple,
  FunnelSimpleX,
  House,
  ImageSquare,
  LockKey,
  MagnifyingGlass,
  MapTrifold,
  Scales,
  SealCheck,
  ShieldWarning,
  WarningCircle,
  WifiHigh,
} from "@phosphor-icons/react";
import {
  accessLevels,
  atlasCases,
  corpusIsStale,
  corpusLastChecked,
  filterCases,
  filterSources,
  geographyOptions,
  getSourceById,
  getSourceTopic,
  humanizeValue,
  initialFilters,
  languageBreakdown,
  relatedCasesFor,
  resourceTypes,
  sourceClassOptions,
  sourceRecords,
  STALE_AFTER_DAYS,
  topicOptions,
  UNDATED_YEAR,
  undatedSourceCount,
  verificationStatuses,
  type AtlasFilters,
  type SourceRecord,
  type VerificationStatus,
} from "./atlasData";
import { withBase } from "./routing";

const unverifiedCount = sourceRecords.filter(
  (record) => record.verification_status !== "verified",
).length;

/** Rows shown before the reader asks for the full list. */
const PREVIEW_ROWS = 6;

const navigation = [
  { label: "Overview", target: "overview", topic: "", icon: House },
  { label: "Case atlas", target: "cases", topic: "", icon: MapTrifold },
  {
    label: "Movement theory",
    target: "sources",
    topic: "movement_theory",
    icon: Brain,
  },
  {
    label: "Civil resistance",
    target: "sources",
    topic: "civil_resistance",
    icon: FlagBanner,
  },
  {
    label: "Digital repression",
    target: "sources",
    topic: "digital_repression",
    icon: ShieldWarning,
  },
  {
    label: "Secure communications",
    target: "sources",
    topic: "secure_communications",
    icon: LockKey,
  },
  { label: "OSINT & evidence", target: "sources", topic: "osint_evidence", icon: Binoculars },
  { label: "Legal rights", target: "sources", topic: "legal_rights", icon: Scales },
  {
    label: "Live monitors",
    target: "sources",
    topic: "connectivity_monitoring",
    icon: WifiHigh,
  },
] as const;

const yearOptions = [
  ...[...new Set(sourceRecords.flatMap((record) => (record.year ? [record.year] : [])))]
    .sort((a, b) => b - a)
    .map((year) => ({ label: year.toString(), value: year.toString() })),
  // Without this, selecting any year silently hides every undated record.
  ...(undatedSourceCount > 0
    ? [{ label: `Undated (${undatedSourceCount})`, value: UNDATED_YEAR }]
    : []),
];

const requestedCaseId = new URLSearchParams(window.location.search).get("case");
const linkedCaseId =
  requestedCaseId && atlasCases.some((record) => record.id === requestedCaseId)
    ? requestedCaseId
    : "";
const linkedInitialFilters: AtlasFilters = { ...initialFilters, caseId: linkedCaseId };

function formatDate(value: string | undefined): string {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function authorLine(source: SourceRecord): string {
  return source.authors.length > 0
    ? `${source.authors.join(", ")} · ${source.publisher}`
    : source.publisher;
}

function verificationLabel(status: VerificationStatus): string {
  return humanizeValue(status);
}

function VerificationMark({
  status,
  caseStatus,
}: {
  status?: VerificationStatus;
  caseStatus?: "Corroborated" | "Corroboration limited" | "Watchlist";
}) {
  const developing =
    status === "needs_review" ||
    status === "unavailable" ||
    caseStatus === "Corroboration limited" ||
    caseStatus === "Watchlist";
  const label = caseStatus ?? (status ? verificationLabel(status) : "Unspecified");
  const Icon = developing ? WarningCircle : SealCheck;

  return (
    <span className={developing ? "verification verification--developing" : "verification"}>
      <Icon aria-hidden="true" size={16} weight="fill" />
      {label}
    </span>
  );
}

function controlledValues(values: readonly string[]): string {
  return values.map(humanizeValue).join(", ");
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  allLabel: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.currentTarget.value)}>
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function App() {
  const stale = useMemo(() => corpusIsStale(), []);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<AtlasFilters>(linkedInitialFilters);
  const [activeSection, setActiveSection] = useState(linkedCaseId ? "Case atlas" : "Overview");
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [showAllCases, setShowAllCases] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);

  const visibleCases = useMemo(() => filterCases(atlasCases, filters, query), [filters, query]);
  const visibleSources = useMemo(
    () => filterSources(sourceRecords, filters, query),
    [filters, query],
  );
  const filtering = query.trim().length > 0 || Object.values(filters).some(Boolean);
  const displayedCases = showAllCases ? visibleCases : visibleCases.slice(0, PREVIEW_ROWS);
  const displayedSources = showAllSources ? visibleSources : visibleSources.slice(0, PREVIEW_ROWS);
  const resultSummary = `${visibleCases.length} ${
    visibleCases.length === 1 ? "case" : "cases"
  } · ${visibleSources.length} ${visibleSources.length === 1 ? "source" : "sources"}`;

  function updateFilter(key: keyof AtlasFilters, value: string) {
    setFilters({ ...filters, [key]: value });
  }

  function resetFilters() {
    setQuery("");
    setFilters(initialFilters);
    setActiveSection("Overview");
    setShowAllCases(false);
    setShowAllSources(false);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = visibleCases.length > 0 ? "cases" : "sources";
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function focusSection(label: string, target: string, topic: string) {
    setActiveSection(label);
    setFilters({ ...filters, caseId: "", topic });
    window.setTimeout(() => {
      const section = document.getElementById(target);
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      section?.focus({ preventScroll: true });
    }, 0);
  }

  /**
   * Expands or collapses a list without touching the search or filters — this
   * previously reset both, silently discarding the query the reader had just
   * typed.
   */
  function toggleList(section: "cases" | "sources") {
    if (section === "cases") setShowAllCases((expanded) => !expanded);
    if (section === "sources") setShowAllSources((expanded) => !expanded);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="atlas-shell">
      <header className="site-header">
        <a
          className="wordmark"
          href="#overview"
          onClick={(event) => {
            event.preventDefault();
            focusSection("Overview", "overview", "");
          }}
        >
          <span>meowmeow</span>
          <Cat aria-hidden="true" className="wordmark-cat" size={22} weight="fill" />
        </a>
        <span className="header-rule" aria-hidden="true" />
        <p>
          <span className="header-product-label">Gen Z Protest Atlas</span>{" "}
          A verified global research index of youth-led protest and digital resistance.
        </p>
        <time className={stale ? "header-check header-check--stale" : "header-check"} dateTime={corpusLastChecked}>
          {stale && <WarningCircle aria-hidden="true" size={14} weight="fill" />}
          Checked <strong>{formatDate(corpusLastChecked)}</strong>
          {stale && <span className="sr-only"> — recheck overdue</span>}
        </time>
      </header>

      <div className="review-banner" role="note">
        <ShieldWarning aria-hidden="true" size={17} weight="fill" />
        <p>
          <strong>Unreviewed research preview.</strong> This corpus has not been assessed by
          legal, regional, language, measurement or digital-forensics reviewers.{" "}
          {unverifiedCount} of {sourceRecords.length} records are not fully verified.
          Do not rely on it for legal, safety or operational decisions.
        </p>
      </div>

      <div className="atlas-layout">
        <aside className="taxonomy">
          <p className="taxonomy-heading">Explore the atlas</p>
          <nav aria-label="Explore meowmeow">
            {navigation.map((item) => {
              const active = activeSection === item.label;
              const Icon = item.icon;

              return (
                <button
                  aria-current={active ? "location" : undefined}
                  className={active ? "taxonomy-link taxonomy-link--active" : "taxonomy-link"}
                  key={item.label}
                  onClick={() => focusSection(item.label, item.target, item.topic)}
                  type="button"
                >
                  <Icon aria-hidden="true" size={19} weight={active ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <a className="taxonomy-link taxonomy-link--route" href={withBase("/visual-archive")}>
              <ImageSquare aria-hidden="true" size={19} />
              <span>Visual archive</span>
            </a>
          </nav>
        </aside>

        <main className="atlas-content">
          <section className="hero" aria-labelledby="atlas-title">
            <h1 id="atlas-title">meowmeow</h1>

            <form className="search-form" onSubmit={handleSearch} role="search">
              <label className="search-input" htmlFor="atlas-search">
                <MagnifyingGlass aria-hidden="true" size={26} weight="regular" />
                <span className="sr-only">
                  Search cases, countries, rights, methods, or sources
                </span>
                <input
                  id="atlas-search"
                  value={query}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                  placeholder="Search cases, countries, rights, methods, or sources"
                  type="search"
                />
              </label>
              <button className="search-button" type="submit">
                View results
                <ArrowRight aria-hidden="true" size={16} weight="bold" />
              </button>
            </form>

            <div className="filter-toolbar">
              <span className="filter-heading">
                <FunnelSimple aria-hidden="true" size={16} weight="bold" />
                Refine the atlas
              </span>
              <span className="filter-result-count">{resultSummary}</span>
            </div>
            <div className="filter-grid" aria-label="Atlas filters">
              <FilterSelect
                label="Case"
                allLabel="All cases"
                value={filters.caseId}
                options={atlasCases.map((record) => ({ label: record.name, value: record.id }))}
                onChange={(value) => updateFilter("caseId", value)}
              />
              <FilterSelect
                label="Topic"
                allLabel="All topics"
                value={filters.topic}
                options={[...topicOptions]}
                onChange={(value) => updateFilter("topic", value)}
              />
              <FilterSelect
                label="Source type"
                allLabel="All types"
                value={filters.resourceType}
                options={resourceTypes.map((type) => ({
                  label: humanizeValue(type),
                  value: type,
                }))}
                onChange={(value) => updateFilter("resourceType", value)}
              />
              <FilterSelect
                label="Geography"
                allLabel="All geographies"
                value={filters.geography}
                options={geographyOptions}
                onChange={(value) => updateFilter("geography", value)}
              />
              <FilterSelect
                label="Publisher class"
                allLabel="All classes"
                value={filters.sourceClass}
                options={sourceClassOptions}
                onChange={(value) => updateFilter("sourceClass", value)}
              />
              <FilterSelect
                label="Year"
                allLabel="All years"
                value={filters.year}
                options={yearOptions}
                onChange={(value) => updateFilter("year", value)}
              />
              <FilterSelect
                label="Verification"
                allLabel="All levels"
                value={filters.verification}
                options={verificationStatuses.map((status) => ({
                  label: verificationLabel(status),
                  value: status,
                }))}
                onChange={(value) => updateFilter("verification", value)}
              />
              <button
                className="clear-button"
                disabled={!filtering}
                onClick={resetFilters}
                type="button"
              >
                <FunnelSimpleX aria-hidden="true" size={16} weight="bold" />
                Clear filters
              </button>
            </div>
            <p className="filter-limits">
              <WarningCircle aria-hidden="true" size={15} weight="fill" />
              <span>
                Filter limits: geography is recorded at the scale each source claims, so
                cities, countries, regions and legal-system areas sit in one list and do not
                roll up &mdash; selecting <em>Africa</em> will not return the African country
                records, and a country will not return <em>Global</em> material that also
                covers it. Year filters the publication year, not the events described;{" "}
                {undatedSourceCount} standing tools and guides carry no publication year and
                appear only under <em>Undated</em>.
              </span>
            </p>
          </section>

          <section className="overview" id="overview" tabIndex={-1}>
            <h2 className="overview-title">
              <Compass aria-hidden="true" size={20} weight="bold" />
              Start here
            </h2>
            <p>
              This atlas curates {sourceRecords.length} reviewed sources and{" "}
              {atlasCases.filter((record) => record.status === "Corroborated").length} corroborated
              cases across movement theory, international rights, network measurement, digital
              forensics, secure communications, and OSINT evidence handling. Open any row for its
              authority, method, limitations, and safety boundaries.
            </p>
            <p className="caveat">
              A bounded research pass, not an exhaustive map of the internet.{" "}
              <span className="inline-developing">Corroboration limited</span>,{" "}
              <span className="inline-developing">Needs review</span> and{" "}
              <span className="inline-developing">Watchlist</span> entries remain provisional.
            </p>
            <p className="caveat">
              Source languages: {languageBreakdown.map(([language, count]) => `${language} (${count})`).join(", ")}.
              {languageBreakdown.length === 1 && (
                <>
                  {" "}
                  <span className="inline-developing">
                    Every record is in {languageBreakdown[0]?.[0]}
                  </span>
                  , so local-language reporting, court filings, and civil-society material are
                  absent from cases outside the anglophone record. Read the coverage as partial.
                </>
              )}
            </p>
            {stale && (
              <p className="caveat caveat--stale">
                <WarningCircle aria-hidden="true" size={16} weight="fill" />
                Links and metadata were last checked on {formatDate(corpusLastChecked)}, more than{" "}
                {STALE_AFTER_DAYS} days ago. Verify any source against its publisher before citing
                it.
              </p>
            )}
          </section>

          <section className="data-section" id="cases" tabIndex={-1} aria-labelledby="cases-heading">
            <div className="section-heading">
              <h2 id="cases-heading">
                <MapTrifold aria-hidden="true" size={20} weight="bold" />
                Current cases
              </h2>
              <button type="button" onClick={() => toggleList("cases")}>
                {showAllCases ? "Show fewer cases" : "View all cases"}{" "}
                <ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>
            <div className="table-wrap">
              <table className="case-table">
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Location</th>
                    <th>Period</th>
                    <th>Evidence status</th>
                    <th>Sources</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCases.map((record) => {
                    const expanded = expandedCaseId === record.id;
                    return (
                      <Fragment key={record.id}>
                        <tr>
                          <td data-label="Case">
                            <button
                              aria-controls={`case-detail-${record.id}`}
                              aria-expanded={expanded}
                              className="row-toggle"
                              onClick={() => setExpandedCaseId(expanded ? null : record.id)}
                              type="button"
                            >
                              <CaretDown aria-hidden="true" className={expanded ? "caret caret--open" : "caret"} size={15} />
                              {record.name}
                            </button>
                          </td>
                          <td data-label="Location">{record.geography}</td>
                          <td data-label="Period">{record.period}</td>
                          <td data-label="Evidence status">
                            <VerificationMark caseStatus={record.status} />
                          </td>
                          <td data-label="Sources">{record.sourceIds.length}</td>
                        </tr>
                        {expanded && (
                          <tr className="detail-row" id={`case-detail-${record.id}`}>
                            <td colSpan={5}>
                              <div className="detail-panel">
                                <div>
                                  <h3>What the reviewed material supports</h3>
                                  <p>{record.summary}</p>
                                </div>
                                <div>
                                  <h3>Evidence note</h3>
                                  <p>{record.evidenceNote}</p>
                                </div>
                                <div className="cited-sources">
                                  <h3>Cited sources</h3>
                                  <ul>
                                    {record.sourceIds.map((id) => {
                                      const source = getSourceById(id);
                                      return source ? (
                                        <li key={id}>
                                          <a href={source.url} rel="noreferrer" target="_blank">
                                            {source.title}
                                            <ArrowSquareOut aria-hidden="true" size={13} />
                                          </a>
                                        </li>
                                      ) : null;
                                    })}
                                  </ul>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {visibleCases.length === 0 && (
              <p className="empty-state">No cases match the current search and filters.</p>
            )}
          </section>

          <section className="data-section" id="sources" tabIndex={-1} aria-labelledby="sources-heading">
            <div className="section-heading">
              <h2 id="sources-heading">
                <Books aria-hidden="true" size={20} weight="bold" />
                Key sources
              </h2>
              <button type="button" onClick={() => toggleList("sources")}>
                {showAllSources ? "Show fewer sources" : "View all sources"}{" "}
                <ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>
            <div className="table-wrap">
              <table className="source-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Institution / Author</th>
                    <th>Year</th>
                    <th>Primary topic</th>
                    <th>Access</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedSources.map((record) => {
                    const expanded = expandedSourceId === record.id;
                    return (
                      <Fragment key={record.id}>
                        <tr>
                          <td data-label="Title">
                            <button
                              aria-controls={`source-detail-${record.id}`}
                              aria-expanded={expanded}
                              className="row-toggle"
                              onClick={() => setExpandedSourceId(expanded ? null : record.id)}
                              type="button"
                            >
                              <CaretDown aria-hidden="true" className={expanded ? "caret caret--open" : "caret"} size={15} />
                              {record.title}
                            </button>
                          </td>
                          <td data-label="Institution / Author">{authorLine(record)}</td>
                          <td data-label="Year">{record.year ?? "Unknown"}</td>
                          <td data-label="Primary topic">{getSourceTopic(record)}</td>
                          <td data-label="Access">{humanizeValue(record.access)}</td>
                          <td data-label="Verification">
                            <VerificationMark status={record.verification_status} />
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="detail-row" id={`source-detail-${record.id}`}>
                            <td colSpan={6}>
                              <div className="detail-panel source-detail">
                                <div>
                                  <h3>Summary</h3>
                                  <p>{record.summary}</p>
                                </div>
                                <div>
                                  <h3>Why it matters</h3>
                                  <p>{record.relevance}</p>
                                </div>
                                <dl className="metadata-list">
                                  <div><dt>Type</dt><dd>{humanizeValue(record.resource_type)}</dd></div>
                                  <div><dt>Published</dt><dd>{formatDate(record.published_date ?? undefined)}</dd></div>
                                  <div><dt>Language</dt><dd>{record.language}</dd></div>
                                  <div><dt>Geography</dt><dd>{record.geographies.join(", ") || "Global / unspecified"}</dd></div>
                                  <div><dt>Cases</dt><dd>{record.cases.join(", ") || "Cross-cutting"}</dd></div>
                                  <div><dt>Topics</dt><dd>{controlledValues(record.taxonomy.topics)}</dd></div>
                                  <div><dt>Source class</dt><dd>{humanizeValue(record.authority.source_class)}</dd></div>
                                  <div><dt>Material role</dt><dd>{humanizeValue(record.authority.material_role)}</dd></div>
                                </dl>
                                <div className="research-profiles">
                                  <section className="research-profile">
                                    <h3>Authority & provenance</h3>
                                    <dl>
                                      <ProfileItem
                                        label="Organization"
                                        value={humanizeValue(record.authority.organization_id)}
                                      />
                                      <ProfileItem
                                        label="Independence group"
                                        value={humanizeValue(record.authority.independence_group)}
                                      />
                                      <ProfileItem
                                        label="Official document"
                                        value={record.identifiers?.official_document_id}
                                      />
                                      <ProfileItem label="DOI" value={record.identifiers?.doi} />
                                      {record.identifiers?.archived_url && (
                                        <div>
                                          <dt>Archived copy</dt>
                                          <dd>
                                            <a
                                              href={record.identifiers.archived_url}
                                              rel="noreferrer"
                                              target="_blank"
                                            >
                                              Snapshot
                                              <ArrowSquareOut aria-hidden="true" size={12} />
                                            </a>
                                          </dd>
                                        </div>
                                      )}
                                      {relatedCasesFor(record).length > 0 && (
                                        <div>
                                          <dt>Related cases</dt>
                                          <dd>
                                            {relatedCasesFor(record).map((related, index) => (
                                              <Fragment key={related.id}>
                                                {index > 0 && ", "}
                                                <a href={`${withBase("/")}?case=${related.id}#cases`}>
                                                  {related.name}
                                                </a>
                                              </Fragment>
                                            ))}
                                          </dd>
                                        </div>
                                      )}
                                    </dl>
                                  </section>

                                  {record.legal_profile && (
                                    <section className="research-profile">
                                      <h3>Legal profile</h3>
                                      <dl>
                                        <ProfileItem
                                          label="Legal system"
                                          value={humanizeValue(record.legal_profile.system)}
                                        />
                                        <ProfileItem
                                          label="Authority"
                                          value={humanizeValue(record.legal_profile.authority_level)}
                                        />
                                        <ProfileItem
                                          label="Instruments"
                                          value={record.legal_profile.instruments.join(", ")}
                                        />
                                        <ProfileItem
                                          label="Applies to"
                                          value={record.legal_profile.applies_to.join(", ")}
                                        />
                                        <ProfileItem
                                          label="Protected rights"
                                          value={controlledValues(record.legal_profile.rights)}
                                        />
                                        <ProfileItem
                                          label="Restriction tests & safeguards"
                                          value={controlledValues(record.legal_profile.restriction_tests)}
                                        />
                                        <ProfileItem
                                          label="Remedies"
                                          value={record.legal_profile.remedies.join(", ")}
                                        />
                                        <ProfileItem
                                          label="Legal caveats"
                                          value={record.legal_profile.caveats.join(" ")}
                                        />
                                      </dl>
                                    </section>
                                  )}

                                  {record.technical_profile && (
                                    <section className="research-profile">
                                      <h3>Technical profile</h3>
                                      <dl>
                                        <ProfileItem
                                          label="System"
                                          value={humanizeValue(record.technical_profile.system_type)}
                                        />
                                        <ProfileItem
                                          label="Method"
                                          value={record.technical_profile.methods.join(", ")}
                                        />
                                        <ProfileItem
                                          label="Technical layers"
                                          value={controlledValues(record.technical_profile.technical_layers)}
                                        />
                                        <ProfileItem
                                          label="Collection"
                                          value={controlledValues(record.technical_profile.collection_modes)}
                                        />
                                        <ProfileItem
                                          label="Signals"
                                          value={record.technical_profile.signals.join(", ")}
                                        />
                                        <ProfileItem
                                          label="Cadence"
                                          value={humanizeValue(record.technical_profile.cadence)}
                                        />
                                        <ProfileItem
                                          label="Geographic resolution"
                                          value={record.technical_profile.geographic_resolution}
                                        />
                                        <ProfileItem
                                          label="Temporal resolution"
                                          value={record.technical_profile.temporal_resolution}
                                        />
                                        <ProfileItem
                                          label="Data access"
                                          value={controlledValues(record.technical_profile.data_access)}
                                        />
                                        <ProfileItem
                                          label="Validation required"
                                          value={record.technical_profile.validation_requirements.join(" ")}
                                        />
                                        <ProfileItem
                                          label="Limitations"
                                          value={record.technical_profile.limitations.join(" ")}
                                        />
                                      </dl>
                                    </section>
                                  )}

                                  {record.evidence_profile && (
                                    <section className="research-profile">
                                      <h3>OSINT & evidence profile</h3>
                                      <dl>
                                        <ProfileItem
                                          label="Role"
                                          value={humanizeValue(record.evidence_profile.role)}
                                        />
                                        <ProfileItem
                                          label="Methods"
                                          value={controlledValues(record.evidence_profile.methods)}
                                        />
                                        <ProfileItem
                                          label="Artifact handling"
                                          value={controlledValues(record.evidence_profile.artifact_handling)}
                                        />
                                        <ProfileItem
                                          label="Privacy"
                                          value={controlledValues(record.evidence_profile.privacy_practices)}
                                        />
                                        <ProfileItem
                                          label="Claim status"
                                          value={humanizeValue(record.evidence_profile.claim_status)}
                                        />
                                        <ProfileItem
                                          label="Limitations"
                                          value={record.evidence_profile.limitations.join(" ")}
                                        />
                                      </dl>
                                    </section>
                                  )}

                                  {record.safety_profile && (
                                    <section className="research-profile research-profile--safety">
                                      <h3>Safety boundary</h3>
                                      <dl>
                                        <ProfileItem
                                          label="Sensitivity"
                                          value={humanizeValue(record.safety_profile.sensitivity)}
                                        />
                                        <ProfileItem
                                          label="Excluded from display"
                                          value={controlledValues(record.safety_profile.exclusions)}
                                        />
                                        <ProfileItem
                                          label="Handling note"
                                          value={record.safety_profile.display_note}
                                        />
                                      </dl>
                                    </section>
                                  )}
                                </div>
                                <div className="verification-note">
                                  <h3>Verification note</h3>
                                  <p>{record.verification_notes}</p>
                                  <p>Last checked {formatDate(record.last_checked)}.</p>
                                </div>
                                <a
                                  className="source-link"
                                  href={record.url}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  Open canonical source
                                  <ArrowSquareOut aria-hidden="true" size={14} />
                                </a>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {visibleSources.length === 0 && (
              <p className="empty-state">No sources match the current search and filters.</p>
            )}
          </section>

          <footer className="atlas-footer">
            <span aria-live="polite">
              Showing {displayedCases.length} of {visibleCases.length} matching cases and{" "}
              {displayedSources.length} of {visibleSources.length} matching sources.
            </span>
            <span>{accessLevels.length} access states tracked · Dates shown in UTC</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
