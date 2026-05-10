---
name: Industrial Precision Visualization
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#c2c6d8'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#8c90a1'
  outline-variant: '#424656'
  surface-tint: '#b3c5ff'
  primary: '#b3c5ff'
  on-primary: '#002b75'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#0054d6'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#b8c8da'
  on-tertiary: '#223240'
  tertiary-container: '#647484'
  on-tertiary-container: '#f5f9ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#d4e4f6'
  tertiary-fixed-dim: '#b8c8da'
  on-tertiary-fixed: '#0d1d2a'
  on-tertiary-fixed-variant: '#394857'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-lg:
    fontFamily: metropolis
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: metropolis
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: metropolis
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: jetbrainsMono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-desktop: 24px
  margin-mobile: 16px
  panel-width-side: 320px
  toolbar-height: 56px
---

## Brand & Style
The design system is engineered for the high-stakes world of AEC (Architecture, Engineering, and Construction), specifically tailored for 3D steel reinforcement and rebar visualization. The brand personality is **authoritative, surgical, and robust**. It evokes the feeling of a sophisticated "Digital Twin" control center where complex structural data is rendered with absolute clarity.

The visual style is a fusion of **Corporate Modern** and **Glassmorphism**, emphasizing structural integrity through thin lines and layered transparency. The interface should feel like an extension of a high-end CAD workstation: minimal distractions, high information density, and a focus on spatial accuracy. The aesthetic prioritizes legibility of complex 3D wireframes against a deep, non-distracting background.

## Colors
The palette is rooted in a "Midnight Navy" foundation to provide maximum contrast for neon-adjacent engineering wireframes. 

- **Primary (Industrial Blue):** Used for structural highlights, primary actions, and selected states.
- **Secondary (Cyan Accent):** Used sparingly for data callouts, active measurement lines, and high-tech "glow" effects.
- **Background:** A deep charcoal (#0A0C10) that reduces eye strain during long-duration technical reviews.
- **Surface:** The use of #151921 with 80% opacity creates a "heads-up display" (HUD) feel, allowing the 3D model to remain partially visible behind control panels.
- **Data Visualization:** Use a cold spectrum (blues, teals, and greys) for standard steel and warm spectrum (oranges, reds) only for interference or structural stress warnings.

## Typography
This design system employs a dual-font strategy to balance corporate professionalism with technical precision. 

- **Metropolis** is used for structural headings, providing a geometric and architectural feel.
- **Inter** handles standard UI copy for maximum readability at small sizes.
- **JetBrains Mono** is utilized for all coordinate data, rebar schedules, and engineering measurements. This ensures that numerical values are perfectly aligned and distinct from descriptive text.

Scale headers down significantly for mobile (e.g., Display-LG becomes 32px) to maintain the "compact tool" aesthetic on smaller devices.

## Layout & Spacing
The layout follows a **Fluid Grid** model with fixed-width sidebars. The center of the screen is reserved for the 3D viewport, with "floating" glass panels docked to the edges. 

- **Desktop:** 12-column grid for overlay menus. Panels are typically docked left (Navigation/Hierarchy) and right (Properties/Details).
- **Rhythm:** A 4px baseline grid ensures tight, technical alignment. Components should use multiples of 4 for padding (8px, 12px, 16px).
- **Margins:** Consistent 24px margins around the main viewport containers. On mobile, the 3D view remains full-screen with collapsible bottom sheets for data.

## Elevation & Depth
Depth is communicated through **Glassmorphism** and light-source simulation rather than heavy drop shadows.

- **Layer 0 (Viewport):** The 3D world space.
- **Layer 1 (Panels):** #151921 at 80% opacity with a 12px Backdrop Blur. Borders are 1px solid at 10% white opacity to define edges without adding visual weight.
- **Layer 2 (Popovers/Tooltips):** Solid #1C212B with a subtle "Ambient Glow" shadow (Primary Blue at 15% opacity, 20px blur) to indicate high-priority interaction.
- **Active State:** Elements being dragged or interacted with in 3D space should receive a 1px Cyan (#00F0FF) outer stroke.

## Shapes
To maintain a professional, "engineered" look, the design system uses a **Soft (0.25rem)** roundedness profile. This prevents the UI from looking too "bubbly" or consumer-grade, maintaining a precision-tool aesthetic.

- **Small Components (Buttons, Inputs):** 4px (0.25rem) radius.
- **Containers (Panels, Cards):** 8px (0.5rem) radius.
- **Control Points (Nodes in 3D):** Perfect circles to differentiate from the angular UI elements.

## Components
- **Buttons:** Primary buttons use a solid Industrial Blue. Secondary buttons are "Ghost" style with a 1px border. All buttons use 14px Medium Inter.
- **Inputs:** Dark backgrounds (#0A0C10) with 1px borders. On focus, the border transitions to Primary Blue with a 2px outer glow.
- **Chips/Status:** Compact, using JetBrains Mono. Status indicators for "Clash Detected" use a red background with white text, while "Verified" uses a subtle green outline.
- **Data Grids:** High-density tables with no vertical lines; use horizontal zebra striping at 2% white opacity. Coordinate data must be Monospaced.
- **3D Gizmos:** Transformation tools (Move/Rotate/Scale) should use the Primary Blue and Cyan colors for their axes to stay consistent with the UI theme.
- **Properties Panel:** Collapsible accordions with 11px uppercase labels for category headers to maximize vertical space for technical attributes.