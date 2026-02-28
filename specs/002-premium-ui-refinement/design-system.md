# Design System: Premium UI Refinement

**Feature**: 002-premium-ui-refinement
**Date**: 2026-02-02
**Purpose**: Define color palette, typography, spacing, and component patterns

---

## Quality Philosophy

| Prefer | Over | Applied To |
|--------|------|------------|
| Premium | Flashy | Color choices, minimal palette |
| Calm | Noisy | Reduced animation, clean backgrounds |
| Fast | Fancy | Performance over effects |
| Subtle | Dramatic | Micro-interactions only |
| Consistency | Variety | Unified component patterns |

---

## Color Palette

### Neutrals (Slate Scale)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `bg-primary` | `white` | `slate-950` | Page backgrounds |
| `bg-secondary` | `slate-50` | `slate-900` | Card backgrounds, sections |
| `bg-tertiary` | `slate-100` | `slate-800` | Hover states, input backgrounds |
| `border-default` | `slate-200` | `slate-700` | Card borders, dividers |
| `border-strong` | `slate-300` | `slate-600` | Input borders, emphasis |
| `text-primary` | `slate-900` | `slate-50` | Headings, body text |
| `text-secondary` | `slate-600` | `slate-400` | Captions, placeholders |
| `text-muted` | `slate-500` | `slate-500` | Disabled states |

### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `accent-primary` | `indigo-600` | Primary buttons, links, focus rings |
| `accent-primary-hover` | `indigo-700` | Hover states |
| `accent-primary-light` | `indigo-50` | Secondary button hover background |
| `accent-secondary` | `slate-600` | Secondary actions |
| `accent-secondary-hover` | `slate-700` | Secondary hover states |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `semantic-error` | `red-500` | Error text, error borders |
| `semantic-error-bg` | `red-50` / `red-950` | Error backgrounds |
| `semantic-warning` | `amber-500` | Warning indicators |
| `semantic-warning-bg` | `amber-50` / `amber-950` | Warning backgrounds |
| `semantic-success` | `green-500` | Success text, completed states |
| `semantic-success-bg` | `green-50` / `green-950` | Success backgrounds |

### Tailwind Config Updates

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Keep slate as primary neutral
        // Remove purple/pink gradient colors from active use
      }
    }
  }
}
```

---

## Typography System

### Font Stack

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Font Weights (Max 3)

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | `400` | Body text, paragraphs |
| Medium | `500` | Subheadings, labels, emphasized text |
| Semibold | `600` | Headings, buttons, navigation |

### Size Scale

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| `text-3xl` | 30px (1.875rem) | 1.2 | Page titles (h1) |
| `text-2xl` | 24px (1.5rem) | 1.3 | Section headings (h2) |
| `text-xl` | 20px (1.25rem) | 1.4 | Card titles (h3) |
| `text-lg` | 18px (1.125rem) | 1.5 | Subheadings (h4) |
| `text-base` | 16px (1rem) | 1.6 | Body text |
| `text-sm` | 14px (0.875rem) | 1.5 | Captions, helper text |
| `text-xs` | 12px (0.75rem) | 1.4 | Badges, labels |

### Heading Styles

```css
/* H1 - Page Title */
.heading-1 {
  @apply text-3xl font-semibold text-slate-900 dark:text-slate-50;
}

/* H2 - Section Heading */
.heading-2 {
  @apply text-2xl font-semibold text-slate-900 dark:text-slate-50;
}

/* H3 - Card Title */
.heading-3 {
  @apply text-xl font-medium text-slate-900 dark:text-slate-50;
}

/* H4 - Subheading */
.heading-4 {
  @apply text-lg font-medium text-slate-800 dark:text-slate-100;
}
```

### Text Colors (No Gradients)

**Prohibited**: Animated gradient text, background-clip text effects
**Allowed**: Solid colors only

---

## Spacing System (8px Grid)

### Base Unit

All spacing values are multiples of 8px (0.5rem).

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px (0.25rem) | Tight spacing, icon gaps |
| `space-2` | 8px (0.5rem) | Inline element gaps |
| `space-3` | 12px (0.75rem) | Form field margins |
| `space-4` | 16px (1rem) | Card padding, section gaps |
| `space-6` | 24px (1.5rem) | Card grid gaps |
| `space-8` | 32px (2rem) | Section padding |
| `space-12` | 48px (3rem) | Large section gaps |
| `space-16` | 64px (4rem) | Page section spacing |
| `space-24` | 96px (6rem) | Hero section padding |

### Layout Containers

```css
/* Max width container */
.container-max {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* Section padding */
.section-padding {
  @apply py-16 md:py-24;
}

/* Card grid */
.card-grid {
  @apply grid gap-4 md:gap-6;
}
```

---

## Component Patterns

### Button Hierarchy

#### Primary Button
```css
.btn-primary {
  @apply
    h-11 px-6
    bg-indigo-600 hover:bg-indigo-700
    text-white font-medium
    rounded-lg
    transition-colors duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply
    h-11 px-6
    bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800
    border border-slate-300 dark:border-slate-600
    text-slate-700 dark:text-slate-300 font-medium
    rounded-lg
    transition-colors duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}
```

#### Ghost Button
```css
.btn-ghost {
  @apply
    h-11 px-4
    bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800
    text-slate-700 dark:text-slate-300 font-medium
    rounded-lg
    transition-colors duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}
```

#### Button States

| State | Effect | Duration |
|-------|--------|----------|
| Hover | Background color shift | 150ms |
| Active/Pressed | `opacity: 0.9` | Instant |
| Focus | Ring indicator | Instant |
| Disabled | `opacity: 0.5`, `cursor: not-allowed` | N/A |

**Prohibited**: Shimmer overlays, 3D transforms, scale animations, ripple effects

### Card System

#### Standard Card
```css
.card {
  @apply
    bg-white dark:bg-slate-900
    border border-slate-200 dark:border-slate-700
    rounded-xl
    shadow-sm
    overflow-hidden;
}

/* Desktop hover (optional) */
@media (hover: hover) {
  .card:hover {
    @apply shadow-md;
  }
}
```

#### Card with Padding
```css
.card-padded {
  @apply card p-4 md:p-6;
}
```

**Prohibited**: Glassmorphism (backdrop-blur) on mobile, 3D hover transforms, gradient borders

### Form Inputs

#### Text Input
```css
.input {
  @apply
    h-11 w-full px-4
    bg-white dark:bg-slate-900
    border border-slate-300 dark:border-slate-700
    rounded-lg
    text-slate-900 dark:text-slate-50
    placeholder:text-slate-500
    transition-colors duration-150 ease-out
    focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500;
}
```

#### Input with Error
```css
.input-error {
  @apply
    border-red-500 focus:border-red-500 focus:ring-red-500;
}

.error-message {
  @apply text-sm text-red-500 mt-1;
}
```

#### Label
```css
.label {
  @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1;
}
```

**Prohibited**: Floating labels, glow effects, animated borders, gradient focus states

### Navigation

#### Header
```css
.header {
  @apply
    fixed top-0 inset-x-0 z-50
    bg-white/95 dark:bg-slate-950/95
    border-b border-slate-200 dark:border-slate-800;
}

/* Disable blur on mobile for performance */
@media (min-width: 768px) {
  .header {
    @apply backdrop-blur-sm;
  }
}
```

#### Nav Link
```css
.nav-link {
  @apply
    px-4 py-2
    text-slate-600 dark:text-slate-400
    hover:text-slate-900 dark:hover:text-slate-50
    hover:bg-slate-100 dark:hover:bg-slate-800
    rounded-lg
    transition-colors duration-150 ease-out;
}

.nav-link-active {
  @apply
    text-indigo-600 dark:text-indigo-400
    bg-indigo-50 dark:bg-indigo-950/50;
}
```

**Prohibited**: Staggered entrance animations, rotating logos, slide-in menus (use instant/fade)

---

## Animation Constraints

### Allowed Micro-Interactions

| Interaction | Property | Duration | Easing |
|-------------|----------|----------|--------|
| Button hover | `background-color` | 150ms | ease-out |
| Button press | `opacity` | Instant | - |
| Input focus | `border-color`, `ring` | 150ms | ease-out |
| Card hover (desktop) | `box-shadow` | 200ms | ease-out |
| Toast entry | `opacity`, `transform` | 200ms | ease-out |
| Loading spinner | `transform: rotate` | 1000ms | linear |

### Animation CSS

```css
/* Base transition */
.transition-micro {
  @apply transition-all duration-150 ease-out;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Prohibited Animations

- Particle effects
- Canvas-based animations
- Floating/orbiting elements
- Parallax scrolling
- Animated gradients (background-position)
- Physics-based animations
- Entrance animations (slide-down, stagger)
- 3D transforms (rotateX, rotateY)
- Shimmer effects
- Ripple effects
- Continuous loops (except loading spinners)

---

## Mobile-First Considerations

### Touch Targets

All interactive elements: minimum `44px × 44px`

```css
.touch-target {
  @apply min-h-[44px] min-w-[44px];
}
```

### Mobile Optimizations

1. **Disable backdrop-blur below md breakpoint**
2. **Stack cards vertically with gap-4**
3. **Increase button/input heights to h-12 on mobile**
4. **Horizontal padding: px-4 minimum**
5. **No hover effects on touch devices** (use `@media (hover: hover)`)

### Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Tablet portrait |
| `md` | 768px | Tablet landscape |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

---

## Accessibility Requirements

### Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (≥18px bold or ≥24px) | 3:1 |
| UI components (buttons, inputs) | 3:1 |

### Focus Indicators

All interactive elements must have visible focus indicators:
```css
focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
```

### ARIA and Semantic HTML

- Use semantic elements (`<button>`, `<nav>`, `<main>`, `<header>`)
- Add `aria-label` for icon-only buttons
- Use `aria-live` for dynamic content (toast notifications)
- Ensure keyboard navigation works for all interactions
