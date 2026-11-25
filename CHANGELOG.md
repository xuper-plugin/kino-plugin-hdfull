# Changelog

## 0.7.1

- The catalog door also lists a series' episodes, for the author's other plugins (std 1.10.0)

## 0.7.0

- Anime on the Home: three rows tagged as anime, so Kino's «Anime» shelf fills: anime airing this week, popular anime series and anime films (Japanese animation from TMDB, only the titles HDFull has with a copy that plays)
- The popular anime row's "see all" opens HDFull's own «Anime» section once the screen has downloaded it
- An anime title appears in its anime row only, so Kino files it as anime and not as a plain series; the recently added rows show 6 titles (a cold Home stays under 20 TMDB calls)

## 0.6.6

- Categorías: every genre tile now shows a picture (a well-known TMDB backdrop per genre, no extra requests)

## 0.6.5

- Back arrow instead of the X: leaving goes back to where you came from (std 1.7.1)

## 0.6.4

- Catalog door: Da-Video finds titles here (std 1.7.0)

## 0.6.3

- Kino's own settings form shows again in Ajustes (settingsIn both); Retry keeps the queued work (std 1.6.2)

## 0.6.2

- Back closes the search box (the screen declares onBack while searching) instead of the whole screen (std 1.6.1)

## 0.6.1

- Opening shows the bar and skeletons instead of a spinner; a failed opening and a re-import after a refresh show Retry / the import step; Back closes the search box; a tab Kino cut short offers Retry (std 1.6.0)

## 0.6.0

- The standard xuper-plugin screen (src/std 1.5.1): one bar with the logo and the name, Buscar (the words go to Kino's own search) and Ajustes (Kino's own form of the settings, and the donation); a hero of slides; cards and slides open Kino's own title page; the catalog download step stays. The source now lives in src/, built into plugin.js. apiVersion 30 (Kino 0.9.91).

