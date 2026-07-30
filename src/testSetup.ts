import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom implements neither of these, and both are called during normal
// rendering (smooth scrolling on navigation, and by Playwright-parity code).
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
