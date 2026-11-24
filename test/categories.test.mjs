// The Categorías tiles: each genre tile carries a static TMDB backdrop (Kino draws a tile's picture from `art`).
import test from "node:test";
import assert from "node:assert/strict";

let genres = [];
globalThis.kino = {
  storage: { get: () => null, set() {}, remove() {}, keys: () => [] },
  log() {}, lang: "es",
  tmdb: async () => ({ genres: genres.map((id) => ({ id, name: "G" + id })) }),
};
const { categories } = await import("../src/plugin.js");

test("every genre tile has an https TMDB art URL, except TV Movie (no fitting picture); an unknown genre has none", async () => {
  genres = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53, 10752, 37];
  const cats = await categories();
  assert.equal(cats.length, 18);
  for (const c of cats) assert.match(c.art, /^https:\/\/image\.tmdb\.org\/t\/p\/w780\/[A-Za-z0-9]+\.jpg$/, c.id);
  assert.equal(cats[0].ref, "browse:genre:28");
  genres = [10770, 999999];
  for (const c of await categories()) assert.equal(c.art, undefined, c.id);
});
