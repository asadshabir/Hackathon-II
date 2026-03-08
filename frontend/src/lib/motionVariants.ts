/**
 * motionVariants.ts
 * Shared Framer Motion variant presets for the TaskFlow light/clay theme.
 * Import variants + use with <motion.div variants={popIn} initial="hidden" animate="show">
 * All durations respect prefers-reduced-motion via the MotionWrapper component.
 */

import type { Variants } from "framer-motion"

/* ── Micro-interaction: element floats up on hover ── */
export const float: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -6,
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
}

/* ── Entry: pop in from slightly below ── */
export const popIn: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.97,
    transition: { duration: 0.18, ease: "easeIn" },
  },
}

/* ── Entry: fade + slide in from below ── */
export const fadeSlide: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: "easeIn" },
  },
}

/* ── List item stagger child ── */
export const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: 8,
    scale: 0.97,
    transition: { duration: 0.18, ease: "easeIn" },
  },
}

/* ── Stagger container — wraps list items ── */
export const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

/* ── 3D icon hover — clay float with subtle rotate ── */
export const clayFloat: Variants = {
  initial: { y: 0, rotateX: 0, rotateZ: 0 },
  hover: {
    y: -8,
    rotateX: 5,
    rotateZ: -2,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
  tap: {
    y: 0,
    scale: 0.93,
    rotateX: 0,
    rotateZ: 0,
    transition: { duration: 0.1 },
  },
}

/* ── Checkmark draw animation (SVG stroke) ── */
export const checkDraw: Variants = {
  unchecked: { pathLength: 0, opacity: 0 },
  checked: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
}

/* ── Scale-in for modals / dialogs ── */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.18, ease: "easeIn" },
  },
}

/* ── Slide in from right (page transitions) ── */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.2, ease: "easeIn" },
  },
}
