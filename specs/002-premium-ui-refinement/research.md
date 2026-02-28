# Research: Premium UI Refinement

**Feature**: 002-premium-ui-refinement
**Date**: 2026-02-02
**Purpose**: Document current state, baseline metrics, and removal targets

---

## Current State Audit

### Component Animation Inventory

| Component | Location | Animation Type | Duration | Impact | Action |
|-----------|----------|----------------|----------|--------|--------|
| `AnimatedBackground` | `components/ui/animated-background.tsx` | 5 floating orbs with parallax, mouse tracking | 18-25s continuous | Very High | **REMOVE** |
| `FloatingParticles` | `components/ui/floating-particles.tsx` | 50 particles with y/x/scale/opacity | 10-20s continuous | High | **REMOVE** |
| `GradientText` | `components/ui/gradient-text.tsx` | Background position gradient shift | 5s continuous | Medium | **SIMPLIFY** |
| `AnimatedButton` | `components/ui/animated-button.tsx` | Shimmer overlay, 3D press, ripple | 3s shimmer, instant press | Medium | **SIMPLIFY** |
| `AnimatedInput` | `components/ui/animated-input.tsx` | Focus glow, floating label, gradient border | 0.3s | Low | **SIMPLIFY** |
| `GlassCard` | `components/ui/glass-card.tsx` | Backdrop blur, 3D hover (rotateX/Y) | Instant hover | Medium | **SIMPLIFY** |
| `HeroSection` | `components/landing/HeroSection.tsx` | 3 floating DIVs with y/rotate/scale | 5-7s continuous | High | **REMOVE floating elements** |
| `DashboardHeader` | `components/layout/DashboardHeader.tsx` | Slide-down entrance, logo rotation, staggered nav | 0.5-1s | Medium | **REMOVE** |
| `TodoCard` | `components/features/TodoCard.tsx` | Entry/exit animations, checkbox spring | 0.2-0.3s | Low | **SIMPLIFY** |
| `MessageBubble` | `components/features/MessageBubble.tsx` | Thinking dots bounce, message scale/opacity | 2s dots, 0.3s entry | Medium | **SIMPLIFY** |

### Animation Usage by Page

| Page | Heavy Animations | Components Used |
|------|-----------------|-----------------|
| Landing (`/`) | ✅ Yes | AnimatedBackground, FloatingParticles, HeroSection floating elements |
| Sign In (`/signin`) | ❓ Likely | AnimatedBackground (if present), AnimatedInput, AnimatedButton |
| Sign Up (`/signup`) | ❓ Likely | AnimatedBackground (if present), AnimatedInput, AnimatedButton |
| Dashboard (`/dashboard`) | ✅ Yes | AnimatedBackground, FloatingParticles, DashboardHeader animations |
| Todos (`/dashboard/todos`) | ⚠️ Medium | TodoCard animations, GlassCard hover |
| Chat (`/dashboard/chat`) | ⚠️ Medium | MessageBubble thinking dots, GlassCard |

### Framer Motion Dependencies

Based on codebase exploration, Framer Motion is used in:
- `animated-background.tsx` - motion.div for orbs
- `floating-particles.tsx` - motion.div for particles
- `gradient-text.tsx` - motion.span for text
- `animated-button.tsx` - motion.button for interactions
- `animated-input.tsx` - motion.div for focus states
- `glass-card.tsx` - motion.div for 3D transforms
- `HeroSection.tsx` - motion.div for floating elements
- `DashboardHeader.tsx` - motion.header, motion.nav
- `TodoCard.tsx` - AnimatePresence, motion.div
- `MessageBubble.tsx` - motion.div for entry/exit

**Decision**: Remove Framer Motion where possible, replace with CSS transitions. If Framer Motion must be kept, limit to presence animations only.

### globals.css Animation Keyframes

Current custom animations in `frontend/src/styles/globals.css`:
- `.animate-gradient` - gradient background animation
- `.shimmer` - shimmer effect keyframe
- Glow effects (`.glow-blue`, `.glow-purple`, `.glow-pink`)
- `.glass` and `.glass-strong` - glassmorphism utilities
- `.preserve-3d`, `.perspective-1000` - 3D transform utilities

**Action**: Remove gradient animation, shimmer, glow effects. Keep basic utilities.

---

## Baseline Performance Metrics (Estimated)

> Note: Actual metrics should be captured by running Lighthouse before implementation

| Page | Est. Performance | Est. FCP | Est. LCP | Est. TTI | Est. CLS |
|------|-----------------|----------|----------|----------|----------|
| Landing | 50-60 | 2.5-3.5s | 3.5-4.5s | 4-6s | 0.15-0.3 |
| Dashboard | 55-65 | 2-3s | 3-4s | 4-5s | 0.1-0.2 |
| Todos | 65-75 | 1.5-2.5s | 2.5-3.5s | 3-4s | 0.05-0.15 |
| Chat | 60-70 | 2-3s | 3-4s | 3.5-4.5s | 0.1-0.2 |

**Root Causes of Poor Performance**:
1. Framer Motion bundle size (~40KB gzipped)
2. Continuous RAF loops for particle/orb animations
3. Backdrop-blur on mobile (GPU intensive)
4. Multiple layout-shifting animations on page load

---

## Removal Checklist

### High Priority (Remove Entirely)

- [ ] `frontend/src/components/ui/animated-background.tsx` - Delete file
- [ ] `frontend/src/components/ui/floating-particles.tsx` - Delete file
- [ ] Remove AnimatedBackground usage from:
  - [ ] `frontend/src/app/page.tsx`
  - [ ] `frontend/src/app/dashboard/layout.tsx`
  - [ ] `frontend/src/app/dashboard/page.tsx` (if present)
- [ ] Remove FloatingParticles usage from same locations
- [ ] Remove floating 3D elements from `HeroSection.tsx`

### Medium Priority (Simplify)

- [ ] `gradient-text.tsx` - Remove animation, keep static gradient or convert to solid
- [ ] `animated-button.tsx` - Remove shimmer, 3D press; keep simple hover/active states
- [ ] `animated-input.tsx` - Remove glow, floating label; use standard focus border
- [ ] `glass-card.tsx` - Remove 3D hover transforms; use shadow elevation
- [ ] `DashboardHeader.tsx` - Remove entrance animation, logo rotation, staggered nav
- [ ] `TodoCard.tsx` - Remove entry/exit animations; instant render
- [ ] `MessageBubble.tsx` - Remove thinking dots bounce; use static dots or simple spinner

### Low Priority (Optional Cleanup)

- [ ] Remove unused CSS keyframes from `globals.css`
- [ ] Remove Framer Motion package if no longer needed
- [ ] Consolidate button variants into single `button.tsx`
- [ ] Consolidate input variants into single `input.tsx`

---

## Technology Decisions

### Decision 1: Framer Motion Handling

**Options Considered**:
1. Remove Framer Motion entirely
2. Keep for presence animations only (AnimatePresence)
3. Replace all animations with CSS transitions

**Decision**: Replace with CSS transitions
**Rationale**:
- Eliminates ~40KB from bundle
- CSS transitions are more performant for simple hover/focus states
- Reduces JavaScript execution time
- Simplifies component code

**Alternative Rejected**: Keeping Framer Motion for presence animations was rejected because AnimatePresence adds complexity and bundle size for marginal benefit. CSS `opacity: 0` to `opacity: 1` transitions provide equivalent UX.

### Decision 2: Color Palette Approach

**Options Considered**:
1. Keep multi-color gradient aesthetic with lighter implementation
2. Switch to monochromatic with single accent
3. Use semantic colors only (error/warning/success)

**Decision**: Single accent color (indigo) + neutrals (slate)
**Rationale**:
- Professional, premium appearance
- Reduces visual noise
- Easier to maintain consistency
- Matches "Premium over Flashy" philosophy

### Decision 3: Glassmorphism Handling

**Options Considered**:
1. Remove glassmorphism entirely
2. Keep on desktop only, disable on mobile
3. Simplify to subtle transparency without blur

**Decision**: Disable backdrop-blur on mobile, keep subtle transparency on desktop
**Rationale**:
- Backdrop-blur is GPU-intensive on mobile
- Desktop can handle the effect
- Maintains some visual interest while prioritizing performance

---

## Implementation Notes

### Files to Delete
```
frontend/src/components/ui/animated-background.tsx
frontend/src/components/ui/floating-particles.tsx
```

### Files to Heavily Modify
```
frontend/src/components/ui/gradient-text.tsx
frontend/src/components/ui/animated-button.tsx
frontend/src/components/ui/animated-input.tsx
frontend/src/components/ui/glass-card.tsx
frontend/src/components/landing/HeroSection.tsx
frontend/src/components/layout/DashboardHeader.tsx
frontend/src/app/page.tsx
frontend/src/app/dashboard/layout.tsx
frontend/src/styles/globals.css
frontend/tailwind.config.ts
```

### Files to Lightly Modify
```
frontend/src/components/features/TodoCard.tsx
frontend/src/components/features/TodoDialog.tsx
frontend/src/components/features/MessageBubble.tsx
frontend/src/components/features/ChatInput.tsx
frontend/src/components/ui/button.tsx
frontend/src/components/ui/input.tsx
frontend/src/components/ui/card.tsx
```

### Files NOT to Touch
```
frontend/src/lib/*          # API client code
frontend/src/hooks/*        # Auth/chat hooks
frontend/src/types/*        # Type definitions
backend/*                   # FROZEN per constitution
```
