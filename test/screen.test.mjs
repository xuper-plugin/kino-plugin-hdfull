// HDFull's screen around the standard one (src/std): the catalog gate in front, skeletons while the first answer is on its way.
import test from "node:test";
import assert from "node:assert/strict";

const store = new Map();
globalThis.kino = {
  storage: { get: (k) => (store.has(k) ? store.get(k) : null), set: (k, v) => store.set(k, v), remove: (k) => store.delete(k), keys: () => [...store.keys()] },
  log() {}, lang: "es",
};
const { screen } = await import("../src/plugin.js");

const RESOLVER = "xuper-plugin/kino-plugin-kino-resolver";
const installed = { [RESOLVER]: true };
const nodes = (t, out = []) => {
  if (Array.isArray(t)) { for (const x of t) nodes(x, out); return out; }
  if (!t || typeof t !== "object") return out;
  if (typeof t.type === "string") out.push(t);
  for (const v of Object.values(t)) if (v && typeof v === "object") nodes(v, out);
  return out;
};

test("before `open` answers: the standard bar and the browse skeletons, not a spinner", async () => {
  const all = nodes(await screen({ state: {}, device: "phone", installed }));
  assert.ok(all.some((n) => n.type === "Skeleton"), "skeletons");
  assert.ok(all.some((n) => n.type === "Text" && n.text === "HDFull"), "the bar's name");
  assert.ok(!all.some((n) => n.type === "CircularProgressIndicator"), "no spinner");
});

test("the catalog gate still shows while downloading / importing, and the idle one offers the download", async () => {
  const dl = nodes(await screen({ state: { ready: true, downloading: true }, device: "phone", installed }));
  assert.ok(dl.some((n) => n.type === "LinearProgressIndicator"));
  const imp = nodes(await screen({ state: { ready: true, importing: true, cursor: 5, total: 10 }, device: "phone", installed }));
  assert.ok(imp.some((n) => n.type === "LinearProgressIndicator" && n.value === 0.5));
  const idle = nodes(await screen({ state: { ready: true, empty: true }, device: "phone", installed }));
  assert.ok(idle.some((n) => n.onPressed === "download"));
});

test("without the resolver: std's install gate first, whatever the catalog state", async () => {
  const all = nodes(await screen({ state: { ready: true, downloading: true }, device: "phone", installed: { [RESOLVER]: false } }));
  assert.ok(all.some((n) => n.onPressed && n.onPressed.go && n.onPressed.go.installPlugin));
});

test("an `open` that fails offers Retry (a failed tab), not skeletons with no timer forever", async () => {
  const { screenEvent } = await import("../src/plugin.js");
  globalThis.kino.catalog = { count: async () => { throw Object.assign(new Error("boom"), { code: "failed" }); } };
  const r = await screenEvent({ name: "open", state: {}, route: { name: "main", params: {} }, device: "phone" });
  assert.equal(r.state.ready, true);
  const tab = r.state.tab;
  assert.ok(tab, "a tab is named");
  assert.equal(r.state.failed && r.state.failed[tab], true);
  const tree = await screen({ state: r.state, device: "phone", installed });
  assert.ok(nodes(tree).some((n) => n.type === "MaterialBanner" && n.action && n.action.onTap === "retry"));
});
