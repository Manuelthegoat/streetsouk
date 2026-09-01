---
name: Street Souk Polished Brutalist
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a29'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d7c2bc'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#ad897e'
  outline-variant: '#52433f'
  surface-tint: '#ffb59e'
  primary: '#ffdbd0'
  on-primary: '#5e1700'
  primary-container: '#ff571a'
  on-primary-container: '#7a4433'
  inverse-primary: '#88503d'
  secondary: '#ffb59e'
  on-secondary: '#5e1700'
  secondary-container: '#ff571a'
  on-secondary-container: '#521300'
  tertiary: '#e5e2e1'
  on-tertiary: '#313030'
  tertiary-container: '#c9c6c6'
  on-tertiary-container: '#535252'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#360f03'
  on-primary-fixed-variant: '#6c3928'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59e'
  on-secondary-fixed: '#3a0b00'
  on-secondary-fixed-variant: '#852400'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display:
    fontFamily: Anton
    fontSize: 80px
    fontWeight: '400'
    lineHeight: 80px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.04em
  body-lg:
    fontFamily: Archivo Narrow
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Archivo Narrow
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
spacing:
  unit: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
This design system embodies a "Polished Brutalist" aesthetic, specifically tailored for high-energy urban events and streetwear culture. It balances raw, industrial elements—like heavy black borders, monospaced type, and sharp corners—with sophisticated digital-first patterns like scrolling tickers and high-contrast color palettes.

The brand personality is aggressive, urgent, and exclusive. It targets a Gen-Z and Millennial audience familiar with "drop" culture. The UI should feel like a digital fanzine: loud, structured, and unapologetically functional, prioritizing high-impact visuals and clear calls to action over subtle transitions or soft aesthetics.

## Colors
The palette is built on a high-contrast foundation of deep charcoal and off-white, punctuated by a vibrant "Fidelity Orange" and a softer "Peach Dust" (Primary). 

- **Primary (#ffb59e):** Used for key accents, borders, and hero text elements.
- **Primary Container (#ff571a):** Reserved for high-priority interactive elements like main action buttons.
- **Surface Tones:** A range of dark greys create subtle depth without breaking the flat, brutalist feel.
- **Functional Accents:** High-contrast black-on-white labels are used for status badges (e.g., "LIVE DROP") to mimic physical price tags or stickers.

## Typography
The typography strategy uses three distinct voices to establish hierarchy:
1.  **Impact (Anton):** Used for headlines and branding. Always uppercase. It provides a heavy, vertical rhythm that commands attention.
2.  **Information (Archivo Narrow):** A condensed sans-serif used for body text and descriptions. Its narrow profile allows for high information density while maintaining a technical, editorial feel.
3.  **Data (JetBrains Mono):** A monospaced font used for labels, tickers, and status indicators. It reinforces the raw, "in-progress" brutalist aesthetic.

## Layout & Spacing
The system uses a fluid 4-column grid for mobile and a 12-column grid for desktop. The layout is box-driven, with clear containment lines.

- **Gutters:** Standard 16px gutter maintains a tight, compact feel.
- **Margins:** 16px on mobile increases to 40px on desktop to provide breathing room for the large display type.
- **Vertical Rhythm:** Spacing is strictly incremental (4, 8, 16, 32) to maintain a mechanical consistency across different sections.

## Elevation & Depth
Depth is not achieved through shadows or blurs, but through **Hard Shadows** and **Offset Strokes**. 

1.  **Hard Shadows:** Interactive cards and buttons use a solid, 100% opacity offset shadow (e.g., 4px or 8px) in the primary color (#ffb59e).
2.  **Active States:** On click/press, elements should "depress" by translating X and Y coordinates to match the shadow offset, making the shadow disappear and simulating a physical button press.
3.  **Framing:** Use 2px solid borders for almost all containers. Double-borders or "corner-bracket" overlays (using absolute positioning) add a layer of technical detail without using Z-axis effects.

## Shapes
The shape language is strictly **Sharp (0px roundedness)**. Every container, button, and image should have square corners to maintain the brutalist integrity. 

**Exceptions:** 
- User avatars may be circular (rounded-full) to provide a soft counterpoint and immediate recognition of "human" elements within the mechanical grid.
- Small decorative icons may use standard stroke weights, but should be contained within square boxes.

## Components

### Buttons
- **Primary Action:** Large, Anton font, background in Primary Container (#ff571a), 2px black or primary border, with a heavy 8px hard shadow.
- **Secondary/Nav:** JetBrains Mono font, 2px border, no fill, 4px hard shadow.

### Cards
- **Product/Drop Cards:** 2px border, grayscale image by default that transitions to color on hover. A solid black or dark-grey footer bar contains the product title in Anton.
- **Feature Cards:** Use a secondary surface color with corner-bracket accents to denote special sections like "Festival Dates."

### Tickers
- A full-width horizontal scrolling bar using JetBrains Mono. Background should be high-contrast (Primary color with dark text) to signal live updates.

### Badges
- Small, rectangular boxes with solid white or black backgrounds and inverted text. These should look like physical stickers or tape labels.

### Navigation
- **Mobile:** A fixed bottom bar with square-tiled buttons. The active state is indicated by a solid fill and hard shadow, while inactive items remain ghosted.
- **Desktop:** A fixed-width sidebar (e.g., 16rem/256px) that mirrors the mobile layout but expands to include full-width list items with headline-level typography.