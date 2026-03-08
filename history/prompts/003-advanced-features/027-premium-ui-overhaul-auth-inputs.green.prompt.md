---
id: "027"
title: "Premium UI Overhaul — Auth Pages & Core Inputs"
stage: green
date: "2026-03-06"
surface: agent
model: claude-sonnet-4-6
feature: "003-advanced-features"
branch: 003-advanced-features
user: Asad Shabir
command: "Still there is alot of error Test all the pages step by step and fix errors and make more advanced login and signup page styling everything should be perfect you can also all styling in all other sections."
labels: ["ui", "auth", "split-screen", "input", "button", "dark-mode", "indigo", "premium"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/app/(auth)/signin/page.tsx
  - frontend/src/app/(auth)/signup/page.tsx
  - frontend/src/components/features/auth/SignInForm.tsx
  - frontend/src/components/features/auth/SignUpForm.tsx
  - frontend/src/components/features/auth/PasswordStrength.tsx
  - frontend/src/components/ui/input.tsx
  - frontend/src/components/ui/password-input.tsx
  - frontend/src/components/ui/button.tsx
  - frontend/src/app/page.tsx
tests:
  - "TypeScript type-check: PASS (0 errors)"
  - "Next.js production build: PASS (12/12 pages)"
  - "git push 003-advanced-features: PASS"
---

## Prompt

Still there is alot of error Test all the pages step by step and fix errors and make more advanced login and signup page styling everything should be perfect you can also all styling in all other sections.

## Response

### Audit (step-by-step page testing)

Read all pages and key components. Found 6 categories of issues:

| Issue | Location | Problem |
|---|---|---|
| Input dark mode | `ui/input.tsx` | Used `input-neu` neumorphic + `dark:from-slate-800 dark:to-slate-900` |
| Password input | `ui/password-input.tsx` | `border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900` |
| Button variants | `ui/button.tsx` | `shadow-neu hover:shadow-neuHover active:shadow-neuInner` (light neumorphic in dark) |
| Form labels | `SignInForm/SignUpForm` | `text-slate-700 dark:text-slate-300` mismatch |
| Auth page design | signin/signup pages | Plain `max-w-sm` card, no visual interest |
| Password strength | `PasswordStrength.tsx` | `bg-slate-300 dark:bg-slate-600` bars |
| Landing bg | `app/page.tsx` | `bg-white dark:bg-black` instead of `#0A0B0F` |

### Fixes Applied

**`ui/input.tsx`**: Replaced neumorphic gradient with `bg-[#181B23] border-white/[0.08]`, indigo focus ring
**`ui/password-input.tsx`**: Same dark surface, white/30 eye icon toggle
**`ui/button.tsx`**: All variants updated:
- `default`: indigo gradient + glow shadow
- `outline`: transparent `bg-indigo-500/[0.06]`, indigo border
- `secondary`: `#181B23` surface
- `ghost`: transparent + white/5 hover
- `link`: indigo text

**`SignInForm.tsx`**: Complete rewrite — icon-prefixed inputs (Mail, Lock), uppercase tracking labels, custom indigo submit button with Loader2 spinner, custom checkbox

**`SignUpForm.tsx`**: Complete rewrite — icon-prefixed (User, Mail, Lock x2), TOC disclaimer, same custom submit

**`PasswordStrength.tsx`**: Dark indigo bars (#3F3F46 empty, colored filled), white/30 base text

**`signin/page.tsx`**: Premium split-screen layout:
- Left (lg+): animated grid background, gradient headline "Get more done with AI", 3 feature rows with icon pills, social proof chip with avatar stack + task count
- Right: form card with indigo glow

**`signup/page.tsx`**: Mirror split-screen:
- Right panel (lg+): emerald headline "The smartest todo app", 4 feature checkmarks, 5-star rating card
- Left: form with "Free forever" chip badge

## Outcome

- ✅ TypeScript: 0 errors
- ✅ Build: 12/12 pages compiled
- ✅ All neumorphic/slate dark-mode artifacts eliminated
- ✅ Auth pages: professional split-screen with animated grid, gradient text, social proof
- ✅ git push d69a0d3 → Vercel auto-deploy triggered
- 📁 9 files changed, 527 insertions, 225 deletions
