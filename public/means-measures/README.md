# Means+Measures CSS

Version 2.0.0 · 14 October 2026 · Base: Identity Standard v1.5

This directory is the website's copy of the Means+Measures Design System package. The brand-wide source is the Means+Measures Design System; the public reference page is [/brand](https://meansandmeasures.com/brand).

## What changed in 2.0.0

- **Type:** Bodoni Moda and Bodoni Moda SC removed. Display is Spectral SemiBold (600), institutional Spectral SC SemiBold (600). Every role now carries a fluid size and line height; body is Spectral Medium (500) at 1.3; action is a synthesized 600.
- **Color:** status colors revised per theme for clarity and dark-theme contrast. Identity gold moved from `#E5B52D` to `#F5B60F`, measured from the logo artwork. Identity colors are non-text without exception.
- **Logo:** new sRGB masters (transparent; 8-bit for use, 16-bit for print), allowed on light and dark grounds, with identity-gold plates at 18%, 36%, 50%, 68% and 82%.
- **Spacing, radius and shadows:** added (v1.5 defined none of them).
- **Components:** Action, Link, Status, Surface and Logo.
- **Package:** specimen page, validation file and font manifest retired; the brand page replaces the specimen. Font declarations trimmed to the weights the roles use.

## Use

Load `means-measures.css`, then place `class="mm"` on the page or region that should use the operational theme. Use `data-mm-theme="dark"` to select dark mode; light is the default. Nested theme regions are supported.

```html
<link rel="stylesheet" href="/means-measures/means-measures.css">
<main class="mm" data-mm-theme="light">
  <h1 class="mm-type-display">Record Sufficiency Matrix</h1>
  <p class="mm-type-institutional">Incidence</p>
  <p class="mm-type-data">12.4 / 100,000</p>
  <p class="mm-type-body">Reported incidence increased relative to the preceding period.</p>
  <button class="mm-action mm-type-action">View report</button>
</main>
```

For typography alone, load `means-measures.typography.css`. In this copy the font rules point at `fonts/` beside the CSS; keep the CSS and `fonts/` together. No external font service is used.

## Typography

| Role | Face | 650px → 1280px viewport | Weight | Line height |
|---|---|---|---|---|
| display | Spectral SemiBold | 40px → 70px | 600 | 1.07 |
| institutional | Spectral SC SemiBold | 18px → 22px | 600 | 1.4 |
| body | Spectral Medium | 17px → 20px | 500 | 1.3 |
| editorial | Spectral SC | 18px → 22px | — | 1.4 |
| ui | Metrophobic | 15px → 16px | — | 1.4 |
| data | Iosevka | 17px → 20px | — | 1.4 |
| action | Pompiere (synthesized 600) | 20px → 24px | 600 | 1.4 |
| detail | Pompiere | 17px → 20px | — | 1.4 |
| specialty | Montserrat | 17px → 20px | — | 1.4 |

The two SC faces are real small-cap fonts; never fake them with `text-transform` or `font-variant`. Sizes are rem-based and assume the browser's default root size, so text-size settings and zoom still apply. Do not change the root font size.

## Color

Protected identity colors `#828A90`, `#293044` and `#F5B60F` belong to the logo and identity graphics only: never text, links, status or interface. Action and focus are never fills. Status colors are border accents beside a visible label. Light is the default; dark is opt-in.

## Spacing, radius, shadows

Spacing is a 4px grid, `--mm-space-1` to `--mm-space-8`; steps 3–8 are fluid with the viewport. Radius is em-based: `--mm-radius-sm` (0.125em) for controls, `--mm-radius-md` (0.2em) for cards, square elsewhere. Shadows are short and hard-edged: `edge`, `raised`, `overlay`.

## Logo

Use the masters as images with real alternative text, on light or dark grounds, optionally on an identity-gold plate (`mm-logo-plate-18`, `-36`, `-50`, `-68`, `-82`). Never rebuild the wordmark in live type, recolor, filter, crop or trace it.

## Files

- `means-measures.css`: complete foundation entry point.
- `means-measures.typography.css`: standalone semantic typography block.
- `means-measures.fonts.css`: local font-face declarations.
- `assets/`: logo masters.
- `fonts/`, `licenses/`: bundled webfonts and their licenses. Bodoni Moda files remain as historical assets and are not assigned to any role.
- `index.html`: redirects to the brand page.
