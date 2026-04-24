---
name: Neo-Bit Monochrome
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#636465'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868382'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  h1:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  h2:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  grid_columns: '12'
  gutter: 24px
---

## Brand & Style

This design system occupies the intersection of nostalgic 8nd-bit aesthetics and sophisticated modern brutalism. It is designed for users who appreciate the "lo-fi" digital heritage but demand the precision and clarity of high-end contemporary software. The personality is confident, tactile, and architecturally sound.

The style leverages high-contrast monochrome palettes to create a "digital paper" feel. It rejects the fluidity of standard modern interfaces in favor of rigid structures, intentional grain, and heavy strokes. By combining "raw" pixel motifs with elegant white space, the design system achieves an "elevated retro" look that feels both archival and futuristic.

## Colors

The palette is strictly monochromatic to emphasize form and texture over hue. 

- **Primary (#1a1a1a):** A "grainy" light black used for heavy borders, primary text, and high-impact surfaces. 
- **Secondary (#e0e0e0):** A structural grey used for secondary actions, dividers, and disabled states.
- **Background (#f5f5f5):** A soft, neutral canvas that prevents the high-contrast elements from feeling overly harsh on the eyes.
- **Surface (#ffffff):** Used for interactive cards and input fields to provide a "pop" of clarity against the soft grey background.

Apply a subtle 2-3% noise/grain texture overlay to all `#1a1a1a` surfaces to evoke a printed or vintage cathode-ray feel.

## Typography

This design system pairs the editorial weight of **Epilogue** with the technical, monospaced-adjacent character of **Space Grotesk**. 

Headlines should be set with tight tracking and heavy weights to act as structural anchors. Body text remains highly legible but retains a "tech" edge. For pixel-inspired accents, use "label-caps" in small sizes. 

To reinforce the retro-pixel aesthetic without sacrificing readability, use custom "pixel-block" underlines (3px height) for emphasized text links rather than standard thin underlines.

## Layout & Spacing

The layout philosophy follows a **fixed-step grid** inspired by early computing interfaces. All spacing is derived from a 4px base unit to ensure alignment with the "pixel" theme.

- Use a 12-column grid for desktop with generous 24px gutters to allow the heavy borders room to breathe.
- Margin areas should be substantial (40px+) to create a "framed" gallery effect.
- Components should stack vertically using hard-edged alignment; avoid offset or staggered layouts. Elements should feel "locked" into the grid.

## Elevation & Depth

This design system rejects soft ambient shadows and glassmorphism. Depth is communicated through **Hard Shadows** and **Tonal Layering**:

- **Level 0 (Base):** Soft grey background (#f5f5f5).
- **Level 1 (Cards/Panels):** White surface (#ffffff) with a 2px solid black border.
- **Level 2 (Interactive/Floating):** White surface with a 4px solid black border and a "hard" drop shadow (offset 4px 4px, 100% opacity, color #1a1a1a).
- **Active State:** When an element is pressed, the hard shadow disappears, and the element shifts 4px down and 4px right to simulate physical displacement.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Every element—buttons, cards, inputs, and images—must have 90-degree corners. This reinforces the pixel-grid foundation and the brutalist influence. To add visual interest, use "stepped" corner accents on large containers: a 4px x 4px "notch" cut out of corners can be used to simulate a low-resolution diagonal line.

## Components

- **Buttons:** 2px solid #1a1a1a borders. Primary buttons use #1a1a1a background with #ffffff text. Secondary buttons use #ffffff background. All buttons must have a "Hard Shadow" that disappears on hover/active.
- **Chips:** Small, rectangular blocks with a 1px border. Use #e0e0e0 for inactive and #1a1a1a for active states. Use All-Caps typography.
- **Lists:** Separated by 2px solid lines. Item hover states should trigger a "checkerboard" pattern background (subtle grey/white) to mimic vintage transparency layers.
- **Inputs:** Thick 2px bottom-border only for a cleaner "modern" look, or full 2px box for a "retro" look. Caret should be a non-blinking solid block.
- **Cards:** White background, 2px solid border, 4px hard shadow. Header sections of cards should be separated by a 2px horizontal rule.
- **Checkboxes:** Square, 0px radius. Checked state is a solid black 6x6 pixel square in the center.
- **Navigation:** Use a "Sidebar" or "Top-bar" that is physically separated from the content by a 4px thick black divider.