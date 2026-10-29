# Site layout and brand page on Design System 2.0.0

Hub item: WEB-040 (see `TODO.md` in the iCloud hub root (`/Users/bjl/Library/Mobile Documents/com~apple~CloudDocs/MeansAndMeasures`)). Branch: `site/v2-layout-brand`, based on `Prime` at `a0325be`. Not merged, not deployed.

## What changed (2026-10-28)

Brian's brief: huge gutters, page titles filling a screen, columns too narrow for the business name (hyphenation/splitting), brand page several updates old, sporadic capitalization, header and footer floating as islands.

| Problem | Cause found | Fix |
|---|---|---|
| Oversized everything | `html { font-size: 20px }` while the 2.0.0 tokens are rem on a 16px root (~25% inflation) | Root left at browser default; package tokens used directly |
| Titles fill the screen | `.hero-title` padding in `vh`, `.homepage-hero` `min-height: 68vh`, h1 up to 7.6rem | h1 = display role (40→70px); no vh-based heights |
| Gutters / odd indent | `.measure` centered a 66ch column inside a 70rem container, so eyebrows and titles sat on different edges | One left edge for everything; `.measure` only limits width |
| Business name split | `overflow-wrap: anywhere` on every `p, li, a, dd` let grid columns shrink below a word's width | Removed (prose uses `break-word`); card grids use `minmax(min(100%, 17.5rem), 1fr)` |
| Sporadic capitals | Spectral SC (real small caps) applied to nav, footer, emails, labels and h2; plus Title Case labels in copy | SC only on eyebrows; nav/labels/footer Metrophobic; headings Spectral SemiBold; labels sentence case |
| Floating header/footer | Thin teal rules around content with no band; footer mid-viewport on short pages | Full-width surface bands, edge shadow, shared page edge; body is a flex column so the footer sits at the foot |
| Brand page stale | Iframe of the v1.0.0 specimen (old gold, Bodoni-era notes, opaque cream logo) | Native `/brand` built from 2.0.0; package CSS upgraded |

Commits: `6a93192` package, `12c4465` layout/chrome (+ KC normalization and WEB-035 hero sizing), `f3b7603` brand page, `1f611c9` sentence case.

## Decisions recorded

- **WEB-035 hero kept.** The homepage name is the Means+Measures logotype, an identity graphic and not text (Brian, 2026-10-28), so identity navy and gold are correct there and the non-text rule is not broken. Navy words and gold plus on one line as specified 2026-10-27; only the size changed (now `min(11.5cqi, 6rem)`). The treatment is for the logotype only, not headings or other text.
- Header shows the mark only. The wordmark is never set in live type next to it.
- Light theme only, as before. Dark theme is opt-in per the system and not wired site-wide.
- `/means-measures/index.html` now redirects to `/brand` so old links still land.

## Open — next agent start here

- [ ] **Logo masters.** The 2.0.0 sRGB masters (transparent, 8-bit) exist only in the Design System artifact's asset store, which agents cannot read. The site still serves ACEScg-era files: `public/means-measures/assets/means-measures-logo-symbol.png` is a 4.6 MB 16-bit ACEScg PNG used as a 48px header icon, and `-wordmark.png` is the opaque Adobe RGB cream version. Brian to supply `means-measures-logo-symbol.png` and `means-measures-logo-wordmark.png` (8-bit sRGB) — drop in at the same paths, no code change. Same for `public/assets/` copies used by OG/social metadata.
- [ ] Review the branch visually (`npm run dev`), then merge to `Prime` and `npm run deploy`; verify `/`, `/brand`, `/procurement`, `/kc`, `/kc/crisis` live.
- [ ] `404.astro` and `500.astro` are standalone pages with their own inline styles and the opaque wordmark; align to the new chrome when the masters land.
- [ ] Unused v1 duplicates at `public/means-measures.css`, `public/means-measures.fonts.css`, `public/means-measures.typography.css`, `public/README.md` and `public/fonts/` — nothing in `src/` references them. Decide disposition (likely remove).
- [ ] KC pages: layout, type and spacing normalized; component styling (triage, service cards, readability controls) otherwise unchanged. A KC-specific design pass is separate work.

## Verification done

`npm run build` passes; `node --test tests/*.test.mjs` 22/22. Screenshots at 1440, 1024 and 390px of `/`, `/about`, `/systems`, `/capabilities`, `/procurement`, `/contact`, `/work`, `/work/forecast`, `/research`, `/civicnavigator`, `/sitemap`, `/brand`, `/kc`, `/kc/crisis`, `/kc/food`, `/kc/directory`.
