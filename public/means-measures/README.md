# Means+Measures CSS

Version 1.0.0 · Based on Identity Standard v1.5 · 24 September 2026

## Use

Keep this directory together. Load `means-measures.css`, then place `class="mm"` on the page or region that should use the operational theme. Use `data-mm-theme="dark"` to select dark mode; light is the default. Nested theme regions are supported. The stylesheet does not select a theme from the operating system automatically.

```html
<link rel="stylesheet" href="/means-measures/means-measures.css">
<main class="mm" data-mm-theme="light">
  <h1 class="mm-type-display">Record Sufficiency Matrix</h1>
  <p class="mm-type-institutional">Incidence</p>
  <label class="mm-type-ui" for="period">Reporting period</label>
  <select id="period" class="mm-type-ui"><option>Last 30 days</option></select>
  <p class="mm-type-data">12.4 / 100,000</p>
  <p class="mm-type-body">Reported incidence increased relative to the preceding period.</p>
  <p class="mm-type-detail">Updated today</p>
  <button class="mm-action mm-type-action">View report</button>
</main>
```

For typography alone, load `means-measures.typography.css`. It includes the font declarations but no theme or component styles. Both entries use relative imports; retain the CSS and fonts together when moving the package. Applications with a Content Security Policy must allow their own styles and font assets. No external font service is used.

Open `index.html` to explore the specimen, switch themes, and see the sample interaction. Its page layout, font sizes and spacing are demonstration choices, not additional brand rules. A normal static web server is the deployment target.

## Typography block

| Class | Attribute equivalent | Face / function |
|---|---|---|
| `mm-type-display` | `data-mm-type="display"` | Spectral Semibold (600) / institutional display |
| `mm-type-institutional` | `data-mm-type="institutional"` | Spectral SC Semibold (600) / compact institutional hierarchy |
| `mm-type-body` | `data-mm-type="body"` | Spectral / sustained reading |
| `mm-type-editorial` | `data-mm-type="editorial"` | Spectral SC / editorial organization |
| `mm-type-ui` | `data-mm-type="ui"` | Metrophobic / operating and navigating |
| `mm-type-data` | `data-mm-type="data"` | Iosevka / short exact quantitative and technical text |
| `mm-type-action` | `data-mm-type="action"` | Pompiere / concise actions |
| `mm-type-detail` | `data-mm-type="detail"` | Pompiere / human and contextual details |
| `mm-type-specialty` | `data-mm-type="specialty"` | Montserrat Variable / specialty and fallback |
| `mm-type-longform-alternate` | `data-mm-type="longform-alternate"` | Optional Source Serif 4, otherwise Spectral |

The two SC faces are separate fonts, not simulated small capitals. No automatic uppercase transformation is applied. Role classes do not set universal sizes, weights, tracking, line height, alignment or heading-to-font mappings. Font synthesis is disabled on role elements; unsupported bold/italic styles are not fabricated. Native variable weight ranges and optical-size axes are preserved, with optical sizing enabled. Source Serif 4 remains optional and is not bundled.

Fonts were repackaged from the installed originals as WOFF, without glyph subsetting. Bodoni Moda, Bodoni Moda SC and Montserrat include variable roman and italic files. Spectral and Spectral SC include 200–800 roman and italic files. Metrophobic and Pompiere supply regular only. Iosevka is the standard installed Iosevka collection, extracted as regular, italic, bold and bold italic; it is not the Nerd Font or the separate IosevkaCustom build. `font-manifest.json` records the exact faces and ranges. Licenses and copyright notices are in `licenses/` and remain embedded in the fonts.

## Identity and logo

`assets/means-measures-logo-wordmark.png` is a byte-for-byte copy of the image the user confirmed as the official logo and wordmark on 24 September 2026. Use it as an image, with meaningful alternative text. `mm-logo` preserves its aspect ratio and allows it to fit its container. Its wordmark is not reconstructed with live type.

The supplied image retains its cream pixels. Their status as an integral logo background versus a separate background remains undecided. No transparency, crop, flattening, color correction, filter or vector tracing has been applied. The operational surface `#FAF3E7` is independently specified in v1.5; it is not a sampled or mandated logo background.

The current explicit logo designation controls the artwork, including where older prose about flat masters or responsive variants differs from the supplied image. This package does not invent compact, micro, inverse or monochrome logo variants. Choose display size and clear space from the actual composition; a detailed logo-plus-wordmark image should not be assumed to remain readable at the small sizes listed for separate variants in the PDF.

Protected identity values are exactly `#828A90`, `#293044`, and `#E5B52D`. “Technical,” “Institutional,” and “Interface” retain the PDF's historical labels; they do not establish a new semantic taxonomy. Operational colors do not alias the protected identity tokens.

## Color provenance and implementation decisions

Light canvas, surface, text, secondary, action, focus, success, info, warning, error and both link colors are transcribed from page 1 of the supplied v1.5 PDF. The dark surface `#2B2F33`, text `#FFFFFF`, secondary `#9AA7AC`, and action `#26C6DA` are recovered from its unlabeled-hex dark swatches. The dark canvas repeats the dark surface as an implementation default because a separate dark canvas is not identified there. Status and focus values remain the published values in both themes; the PDF does not specify separate dark variants for them.

Action and Focus are used as foregrounds/outlines, never fills. Status utilities retain the theme's primary text and use status color as a supplemental border; markup must include a visible status label or other non-color cue. The `data-mm-status` attribute does not itself provide an accessible name, live announcement, or ARIA role.

The exact orange focus value does not reach 3:1 against the light canvas/surface. The implementation keeps orange as an outline and adds a separate high-contrast outer ring using the primary text color. That ring, its thickness, and the control-border alias are implementation choices, not changes to published colors. Parent clipping can still hide any external focus indicator; verify focus in the consuming layout.

Published status tokens are not universally suitable as small text colors in both themes. The supplied status pattern avoids that use. Identity and palette swatches in the specimen are demonstrations, not actionable controls or information conveyed only by color. Forced-colors mode yields to system colors.

## Verification

See `validation.json` for CSS parsing, local asset resolution, font metadata/weight ranges, source-logo hash equality and foreground/background contrast calculations. Browser rendering was not verified: the available browser security policy blocked opening the local specimen, and no workaround was attempted. The specimen is provided for direct review in a browser; visual rendering, keyboard behavior and responsive layout still need that review.

## Files

- `means-measures.css`: complete foundation entry point.
- `means-measures.typography.css`: standalone semantic typography block.
- `means-measures.fonts.css`: local font-face declarations.
- `index.html`: light/dark interactive specimen.
- `assets/`: unchanged official logo and wordmark.
- `fonts/`, `font-manifest.json`, `licenses/`: bundled webfonts and provenance.
- `validation.json`: completed static checks and explicit verification limits.

Display and institutional roles were amended on October 14, 2026 to Spectral Semibold and Spectral SC Semibold for stroke legibility. Bundled Bodoni files remain historical assets and are no longer assigned to these roles.
