import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { App } from "./App";

function renderAtlas() {
  return { user: userEvent.setup(), ...render(<App />) };
}

describe("atlas filtering", () => {
  test("expanding a list preserves the reader's search", async () => {
    const { user } = renderAtlas();
    const search = screen.getByLabelText("Search cases, countries, rights, methods, or sources");

    await user.type(search, "Finance Bill");
    expect(search).toHaveValue("Finance Bill");

    await user.click(screen.getByRole("button", { name: /View all sources/ }));

    // Regression: this used to clear the query and every filter.
    expect(search).toHaveValue("Finance Bill");
    expect(screen.getByRole("button", { name: /Show fewer sources/ })).toBeInTheDocument();
  });

  test("expanding a list preserves an active dropdown filter", async () => {
    const { user } = renderAtlas();
    const topic = screen.getByRole("combobox", { name: "Topic" });

    await user.selectOptions(topic, "connectivity_monitoring");
    await user.click(screen.getByRole("button", { name: /View all cases/ }));

    expect(topic).toHaveValue("connectivity_monitoring");
  });

  test("clear filters resets search, filters, and expansion together", async () => {
    const { user } = renderAtlas();
    const search = screen.getByLabelText("Search cases, countries, rights, methods, or sources");
    const clear = screen.getByRole("button", { name: /Clear filters/ });

    expect(clear).toBeDisabled();

    await user.type(search, "Kenya");
    await user.selectOptions(screen.getByRole("combobox", { name: "Verification" }), "verified");
    expect(clear).toBeEnabled();

    await user.click(clear);

    expect(search).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Verification" })).toHaveValue("");
    expect(clear).toBeDisabled();
  });

  test("truncates to a preview and expands on request", async () => {
    const { user } = renderAtlas();
    const caseSection = document.getElementById("cases");
    if (!caseSection) throw new Error("case section missing");

    const previewRows = within(caseSection).getAllByRole("row").length;
    await user.click(screen.getByRole("button", { name: /View all cases/ }));

    expect(within(caseSection).getAllByRole("row").length).toBeGreaterThan(previewRows);
  });

  test("reports no results rather than an empty table", async () => {
    const { user } = renderAtlas();

    await user.type(
      screen.getByLabelText("Search cases, countries, rights, methods, or sources"),
      "zzzzzznotarealquery",
    );

    expect(screen.getByText(/No cases match the current search/)).toBeInTheDocument();
    expect(screen.getByText(/No sources match the current search/)).toBeInTheDocument();
  });
});

describe("evidence disclosure", () => {
  test("row toggles expose their detail region to assistive technology", async () => {
    const { user } = renderAtlas();
    const toggle = screen.getAllByRole("button", { expanded: false })[0];
    if (!toggle) throw new Error("no collapsible row found");

    const controlled = toggle.getAttribute("aria-controls");
    expect(controlled).toBeTruthy();
    expect(document.getElementById(controlled ?? "")).toBeNull();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(controlled ?? "")).not.toBeNull();
  });

  test("states the English-only limitation of the corpus", () => {
    renderAtlas();

    expect(screen.getByText(/Source languages:/)).toBeInTheDocument();
    expect(screen.getByText(/Every record is in English/)).toBeInTheDocument();
  });

  test("marks provisional cases rather than presenting them as settled", async () => {
    const { user } = renderAtlas();

    await user.selectOptions(screen.getByRole("combobox", { name: "Case" }), "morocco-2025");

    const caseSection = document.getElementById("cases");
    if (!caseSection) throw new Error("case section missing");
    expect(within(caseSection).getByText("Corroboration limited")).toBeInTheDocument();

    // The limitation is stated in the case's own evidence note, not just as a badge.
    await user.click(within(caseSection).getByRole("button", { expanded: false }));
    expect(within(caseSection).getByText(/share one independence group/)).toBeInTheDocument();
  });
});
