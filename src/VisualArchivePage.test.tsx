import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { NotFoundPage } from "./NotFoundPage";
import { VisualArchivePage } from "./VisualArchivePage";
import { supportingVisualRecords, visualArchiveRecords } from "./visualArchiveData";

describe("visual archive page", () => {
  test("renders every record without hotlinking a remote host", () => {
    render(<VisualArchivePage />);
    const images = screen.getAllByRole("img");

    expect(images).toHaveLength(visualArchiveRecords.length);
    for (const image of images) {
      expect(image.getAttribute("src")).toMatch(/^\/visual-archive\//);
      expect(image.getAttribute("srcset") ?? "").not.toMatch(/https?:/);
    }
  });

  test("serves resized derivatives so a phone does not download the archival plate", () => {
    render(<VisualArchivePage />);
    const image = screen.getAllByRole("img")[0] as HTMLImageElement;

    expect(image.getAttribute("srcset")).toMatch(/\/visual-archive\/derived\/[a-z0-9-]+-480\.jpg 480w/);
    expect(image.getAttribute("sizes")).toBeTruthy();
    // The digest-attested original stays reachable as the largest candidate.
    expect(image.getAttribute("srcset")).toContain(image.getAttribute("src"));
  });

  test("derives the supporting-record count instead of hardcoding it", () => {
    render(<VisualArchivePage />);

    expect(
      screen.getByText(`${supportingVisualRecords.length} more records`, { exact: false }),
    ).toBeInTheDocument();
  });

  test("falls back to a labelled placeholder when an image cannot load", () => {
    render(<VisualArchivePage />);

    expect(screen.queryByText(/Image unavailable/)).not.toBeInTheDocument();

    fireEvent.error(screen.getAllByRole("img")[0]!);

    expect(screen.getByText(/Image unavailable/)).toBeInTheDocument();
    expect(screen.getByText(/verified context and source record remain below/)).toBeInTheDocument();
  });

  test("keeps license and safety boundaries attached to each photograph", () => {
    render(<VisualArchivePage />);

    expect(screen.getAllByText(/Verification, rights & safety/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /CC/ }).length).toBeGreaterThan(0);
  });
});

describe("not found page", () => {
  test("offers the real routes instead of silently showing the homepage", () => {
    render(<NotFoundPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /not part of the atlas/i,
    );
    expect(screen.getByRole("link", { name: /Research atlas/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Visual archive/ })).toHaveAttribute(
      "href",
      "/visual-archive",
    );
  });
});
