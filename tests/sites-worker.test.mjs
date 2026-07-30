import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

/** Builds an ASSETS stub that serves the given paths and 404s everything else. */
function assetsFor(available, calls = []) {
  return {
    fetch: async (request) => {
      const url = new URL(request.url);
      calls.push(url.pathname + url.search);
      return available.has(url.pathname)
        ? new Response(available.get(url.pathname), { status: 200 })
        : new Response("missing", { status: 404 });
    },
  };
}

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: assetsFor(new Map([["/assets/app.js", "asset"]]), calls),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("serves an unknown app route as a real 404, not the homepage", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: assetsFor(
        new Map([
          ["/index.html", "app"],
          ["/404.html", "not found"],
        ]),
        calls,
      ),
    },
  );

  // The old behaviour returned 200 with the atlas homepage, which made rotted
  // citation links look like they had resolved.
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "not found");
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/404.html"]);
});

test("keeps the original 404 when no 404 document was built", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/missing", { headers: { accept: "text/html" } }),
    { ASSETS: assetsFor(new Map()) },
  );

  assert.equal(response.status, 404);
});

test("does not turn missing API or write requests into an HTML document", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    const calls = [];
    const response = await worker.fetch(request, {
      ASSETS: assetsFor(new Map([["/404.html", "not found"]]), calls),
    });

    assert.equal(response.status, 404);
    assert.equal(calls.length, 1);
  }
});

test("sets baseline security headers on every response", async () => {
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: assetsFor(new Map([["/assets/app.js", "asset"]])),
  });

  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
});

test("emits the files required by Sites packaging", async () => {
  for (const file of [
    "../dist/client/index.html",
    "../dist/client/visual-archive.html",
    "../dist/client/404.html",
    "../dist/client/sitemap.xml",
    "../dist/client/robots.txt",
    "../dist/server/index.js",
    "../dist/.openai/hosting.json",
  ]) {
    await access(new URL(file, import.meta.url));
  }
});
