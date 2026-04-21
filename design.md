# Relath UI — Art Deco (“Gatsby”) design system

This document is the authoritative visual language for premium surfaces in **relath01**.  
Implementation in code uses **CSS variables** (`web/src/styles/global.css`), **Ant Design ConfigProvider theme** (`web/src/theme/stitchRelathTheme.ts`), and React components—not Tailwind unless explicitly introduced later.

---

## Adaptation notes (this repo)

| Guideline concept | Where it lives in relath01 |
|-------------------|---------------------------|
| Background / foreground / accents | Extend `:root` tokens in `web/src/styles/global.css`; align Ant Design `token` in `stitchRelathTheme.ts` |
| Typography (Marcellus, Josefin Sans) | Load fonts in `web/index.html` or `@import` in CSS; set `token.fontFamily` / heading classes |
| Sharp geometry, gold borders | Prefer `border-radius: 0`–`2px`; border colors from `--relath-*` mapped to `#D4AF37` palette |
| Glow vs drop shadow | `box-shadow` with gold rgba halos on buttons/cards |
| Grain / diagonal hatch | Pseudo-element on `.relath-app-shell` or page root with `repeating-linear-gradient` |
| Components | Prefer Ant Design primitives styled via `theme.components` + scoped classes (existing `relath-*` pattern) |

Existing **Neural Cartographer** blues may coexist with Art Deco gold on marketing or “console” shells; namespace new Art Deco surfaces (e.g. `.relath-artdeco-*`) when applying side-by-side.

---

## Role (for contributors & AI assistants)

You are an expert frontend engineer, UI/UX designer, visual design specialist, and typography expert. Your goal is to help integrate this design system into the codebase in a way that is visually consistent, maintainable, and idiomatic to the tech stack (**React 18, Ant Design 5, Vite**).

Before proposing or writing code, build a mental model of the current system:

- Identify the tech stack (React, Vite, Ant Design, optional G6).
- Understand existing design tokens (`global.css`, `stitchRelathTheme.ts`), global styles, and utility patterns.
- Review component architecture (`AppShell`, `PageShell`, pages under `web/src/pages/`) and naming (`relath-*` CSS classes).
- Note constraints (Ant Design theming, bundle size for fonts, legacy CSS coexistence).

Clarify scope when unclear: single page vs refactor vs net-new flows.

Prioritize centralizing tokens, reusability, minimal one-off styles, accessibility, responsiveness, and deliberate aesthetic choices—not generic SaaS boilerplate.

---

## Design philosophy

Art Deco embodies **opulence, mathematical precision, and architectural grandeur**. **Maximalist restraint**: ornamental but placed with intent. Sharp angles, geometric repetition, symmetry, verticality, metallic luxury, theatrical interaction.

### Emotional resonance

Confidence, heritage, exclusivity, optimism, sophistication—for premium, cultural, heirloom-grade experiences.

### Core principles

**Geometry as decoration** — triangles, chevrons, sunbursts, stepped forms, rhythm through repetition.

**Contrast as drama** — obsidian black vs radiant gold; no muddy middle.

**Symmetry and balance** — bilateral symmetry, ceremonial layouts.

**Verticality** — upward rhythm, stacked “floors.”

**Material luxury** — brass, etched glass, lacquer; metallic sheens and layered glow.

**Theatricality** — dramatic transitions, glowing hovers, elevator-panel interactions.

---

## Design token system

### Colors (dark luxury palette)

| Token | Hex | Usage |
|-------|-----|--------|
| Background | `#0A0A0A` | Obsidian page canvas |
| Foreground | `#F2F0E4` | Primary text (champagne cream) |
| Card background | `#141414` | Elevated surfaces |
| Primary accent (gold) | `#D4AF37` | Borders, headings, CTAs |
| Secondary accent | `#1E3D59` | Midnight depth / inactive variants |
| Border | `#D4AF37` | Celebrated framing |
| Muted | `#888888` | Secondary text |

### Typography

- **Headings**: Marcellus or Italiana (Google Fonts)—Roman structure, Deco flair.
- **Body**: Josefin Sans—geometric, readable.
- **Scale**: Strong hierarchy—large display headings, uppercase + wide tracking for hero/display; body comfortable size and leading.

### Radius & border

- Radius: **`0`** or **`2px`** maximum—sharp discipline.
- Borders: **1px** precise lines; double-line frames optional (**3px** doubled aesthetic).
- Stepped corners: `clip-path` or pseudo-elements for ziggurat cuts.

### Shadows & effects

- Glow: `box-shadow: 0 0 15px rgba(212, 175, 55, 0.2)` (gold halo).
- Gradients: metallic sheen on buttons/borders (gold light → gold dark).
- Texture: subtle film grain / noise overlay on background.

---

## Component stylings

### Buttons (precision instruments)

- Sharp corners (or 2px max).
- Min height **48px** (touch).
- **ALL CAPS** + wide letter-spacing.
- **2px** gold border; hover: fill + glow intensification (`0 0 20px rgba(212,175,55,0.4)`).
- Variants: outline gold on transparent; solid gold field + dark text; outline hover → midnight fill.
- Transition **300–500ms**, mechanical easing.

### Cards (geometric containers)

- Background `#141414`; **1px** gold border **30% opacity** → **100%** on hover.
- Corner **L-brackets** (two corners opposed).
- Header separator: bottom border ~20% gold.
- Hover: slight lift (`translateY`), border brighten, bracket opacity 50% → 100%.
- Title: display font, gold, uppercase, tracking; description: muted body.

### Inputs (underlined elegance)

- Transparent field; **bottom border only** 2px gold.
- Height **48px**; champagne text; pewter placeholders.
- Focus: brighter gold underline + soft gold shadow under line.
- Labels: uppercase xs/sm, gold when active.

---

## Signature motifs (non-generic)

1. **Diagonal crosshatch** — `repeating-linear-gradient` ±45°, gold **3–5%** opacity on canvas.
2. **Rotated diamond frames** — outer `rotate(45deg)`, inner content `-rotate-45deg`.
3. **Roman numerals** — tiers/steps in display serif.
4. **Stepped corner ornaments** — pseudo-elements, ziggurat clips.
5. **Double-frame media** — outer gold + inner dark inset; optional grayscale → color/gold on hover.
6. **Sunburst radials** — `radial-gradient` gold **10–20%** from focal points.
7. **Section dividers** — short gold rules flanking headings (not full bleed).
8. **Vertical architectural rules** — `1px` gold low-opacity column separators.
9. **Glow over diffuse shadow** — neon / marquee backlight metaphor.
10. **ALL CAPS display + extreme tracking** — mandatory voice for hero/display lines.

---

## Layout & spacing

- Max width: ~**1152px** (`max-w-6xl` equivalent) primary; wider grids where needed.
- Section rhythm: generous vertical padding (e.g. **128px** equivalent where appropriate).
- Card padding ~**32px**; grid gaps ~**32px**.
- Prefer **even** column counts at breakpoint (3 / 2 / 1 typical).
- Centered axis for heroes; intentional negative space as “stage.”

---

## Animation & interaction

- Theatrical / mechanical—not bouncy.
- **300ms** quick; **500ms** dramatic; `ease-out` / `ease-in-out`.
- Cards: lift + border glow; buttons: glow expansion; links: gold + underline growth.
- Optional staggered reveals; sunburst expand on hero load.

---

## Accessibility

- **Contrast**: cream on black for long body; gold for accents/display; verify WCAG for small gold-on-black text.
- **Focus**: visible gold ring / offset on interactive controls.
- **Touch**: ≥**44×44px** targets; primary buttons ≥**48px** height.
- **Decorative geometry**: `aria-hidden="true"` where purely ornamental.
- Meaningful labels, alt text, keyboard order.

---

## Tailwind references in this document

Where the original brief cites Tailwind utilities (`text-6xl`, `rounded-none`, etc.), translate to:

- CSS modules / `global.css` classes, or
- Ant Design `theme.token` / `theme.components`, or
- Scoped `.relath-artdeco-*` rules.

Do **not** assume Tailwind is installed unless `package.json` includes it.
