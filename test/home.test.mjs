// The Home rows (owner, 2026-11-24): anime rows tagged "anime" so Kino's «Anime» shelf takes them, kept to the index
// (titles with a captcha-free copy), and an anime title only in its anime row.
import test from "node:test";
import assert from "node:assert/strict";

const store = new Map();
const tmdbCalls = [];
let inIndex = new Set();
const result = (id, tv) => ({ id, ...(tv ? { name: "S" + id, first_air_date: "2024-01-01" } : { title: "M" + id, release_date: "2024-01-01" }), poster_path: "/p" + id + ".jpg" });
globalThis.kino = {
  lang: "es", language: "es",
  storage: { get: (k) => (store.has(k) ? store.get(k) : null), set: (k, v) => store.set(k, v), remove: (k) => store.delete(k), keys: () => [...store.keys()] },
  catalog: { get: async (ids) => ids.filter((id) => inIndex.has(id)).map((id) => ({ id, data: {} })) },
  log() {},
  error: (code, message, opts = {}) => Object.assign(new Error(message), { code, ...opts }),
  tmdb: async (path, params) => {
    tmdbCalls.push({ path, params });
    const tv = path.includes("/tv");
    if (/^\/(movie|tv)\/\d+$/.test(path)) return result(Number(path.split("/")[2]), tv);
    // Every list answers the same five ids: 1..4 are in the index, 5 is not.
    return { results: [1, 2, 3, 4, 5].map((id) => result(id, tv)), total_pages: 3 };
  },
};
const plugin = await import("../src/plugin.js");

function reset() {
  store.clear(); tmdbCalls.length = 0;
  store.set("catRecentM", JSON.stringify(["m:9"])); store.set("catRecentS", JSON.stringify(["s:8"]));
  inIndex = new Set(["m:1", "m:2", "m:3", "m:4", "s:1", "s:2", "s:3", "s:4", "m:9", "s:8"]);
}

test("the anime rows carry Kino's anime tag and ask TMDB for Japanese animation: airing this week, popular, films", async () => {
  reset();
  const rows = await plugin.home();
  const anime = rows.filter((r) => r.genre === "anime");
  assert.deepEqual(anime.map((r) => r.id), ["animeAiring", "anime", "animeMovies"]);
  assert.deepEqual(anime.map((r) => r.title), ["Anime en emisión", "Anime popular", "Películas de anime"]);
  for (const r of rows.filter((x) => x.genre !== "anime")) assert.ok(r.genre === "peliculas" || r.genre === "series", r.id);
  const lists = tmdbCalls.filter((c) => c.params && c.params.with_original_language === "ja");
  assert.equal(lists.length, 3);
  assert.ok(lists.every((c) => c.params.with_genres === 16 && c.path.startsWith("/discover/")));
  const airing = lists.find((c) => "air_date.gte" in c.params).params;
  assert.match(airing["air_date.gte"], /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(airing["air_date.gte"] < airing["air_date.lte"]);
  assert.equal(anime.find((r) => r.id === "animeMovies").items[0].kind, "movie");
  assert.equal(anime.find((r) => r.id === "anime").items[0].kind, "series");
  // A cold Home stays under Kino's 20 TMDB calls per 10 s.
  assert.ok(tmdbCalls.length <= 20, "calls: " + tmdbCalls.length);
});

test("only titles in the index (they have a copy that plays), and an anime title only in its anime row", async () => {
  reset();
  const rows = await plugin.home();
  for (const r of rows) assert.ok(r.items.every((i) => inIndex.has(i.ref)), r.id);
  const animeRefs = new Set(rows.filter((r) => r.genre === "anime").flatMap((r) => r.items.map((i) => i.ref)));
  assert.ok(animeRefs.has("s:1") && animeRefs.has("m:1"));
  for (const r of rows.filter((x) => x.genre !== "anime")) assert.ok(r.items.every((i) => !animeRefs.has(i.ref)), r.id);
});

test("the popular anime row opens HDFull's own «Anime» section once the screen has it; the others page their list", async () => {
  reset();
  assert.equal((await plugin.home()).find((r) => r.id === "anime").ref, "browse:anime");
  store.set("catGenres", JSON.stringify({ Anime: "s:1,s:2", Drama: "m:4" }));
  assert.equal((await plugin.home()).find((r) => r.id === "anime").ref, "browse:hdgenre:Anime");
  const page = await plugin.browse("browse:animeAiring", null);
  assert.ok(page.items.length > 0);
  assert.ok(page.items.every((i) => i.kind === "series"));
  assert.ok((await plugin.browse("browse:animeMovies", null)).items.every((i) => i.kind === "movie"));
});
