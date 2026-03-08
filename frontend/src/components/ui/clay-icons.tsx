"use client"

/**
 * clay-icons.tsx
 * 3D clay-style SVG icon components.
 * Each icon uses layered radial/linear gradients + a soft drop-shadow filter
 * to create a soft-plastic / clay look at any size.
 * Animate with the clayFloat variant from motionVariants.ts.
 */

import { motion } from "framer-motion"
import { clayFloat } from "@/lib/motionVariants"

interface ClayIconProps {
  size?: number
  className?: string
  /** Animate on hover */
  animate?: boolean
}

/* ── shared filter id prefix ── */
const uid = (name: string) => `clay-${name}`

/* ─────────────────────────────────────── */
/*  ClayCheckIcon — indigo check bubble   */
/* ─────────────────────────────────────── */
export function ClayCheckIcon({ size = 48, className = "", animate = true }: ClayIconProps) {
  const Wrapper = animate ? motion.div : "div"
  const props = animate ? { variants: clayFloat, initial: "initial", whileHover: "hover", whileTap: "tap" } : {}

  return (
    <Wrapper className={`inline-flex ${className}`} style={{ perspective: 400 }} {...(props as object)}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={uid("check-bg")} cx="38%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4338CA" />
          </radialGradient>
          <radialGradient id={uid("check-shine")} cx="30%" cy="20%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id={uid("check-shadow")} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(79,70,229,0.35)" />
          </filter>
        </defs>
        {/* Body */}
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("check-bg")})`} filter={`url(#${uid("check-shadow")})`} />
        {/* Shine */}
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("check-shine")})`} />
        {/* Checkmark */}
        <path d="M14 24.5L21 31.5L34 18" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Wrapper>
  )
}

/* ─────────────────────────────────────── */
/*  ClayPlusIcon — teal add bubble        */
/* ─────────────────────────────────────── */
export function ClayPlusIcon({ size = 48, className = "", animate = true }: ClayIconProps) {
  const Wrapper = animate ? motion.div : "div"
  const props = animate ? { variants: clayFloat, initial: "initial", whileHover: "hover", whileTap: "tap" } : {}

  return (
    <Wrapper className={`inline-flex ${className}`} style={{ perspective: 400 }} {...(props as object)}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={uid("plus-bg")} cx="35%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0891B2" />
          </radialGradient>
          <radialGradient id={uid("plus-shine")} cx="28%" cy="18%" r="52%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id={uid("plus-shadow")} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(6,182,212,0.35)" />
          </filter>
        </defs>
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("plus-bg")})`} filter={`url(#${uid("plus-shadow")})`} />
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("plus-shine")})`} />
        <path d="M24 14V34M14 24H34" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    </Wrapper>
  )
}

/* ─────────────────────────────────────── */
/*  ClayTrashIcon — rose delete bubble   */
/* ─────────────────────────────────────── */
export function ClayTrashIcon({ size = 48, className = "", animate = true }: ClayIconProps) {
  const Wrapper = animate ? motion.div : "div"
  const props = animate ? { variants: clayFloat, initial: "initial", whileHover: "hover", whileTap: "tap" } : {}

  return (
    <Wrapper className={`inline-flex ${className}`} style={{ perspective: 400 }} {...(props as object)}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={uid("trash-bg")} cx="35%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#E11D48" />
          </radialGradient>
          <radialGradient id={uid("trash-shine")} cx="28%" cy="18%" r="52%">
            <stop offset="0%" stopColor="white" stopOpacity="0.38" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id={uid("trash-shadow")} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(225,29,72,0.35)" />
          </filter>
        </defs>
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("trash-bg")})`} filter={`url(#${uid("trash-shadow")})`} />
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("trash-shine")})`} />
        <path d="M15 19H33M21 19V15H27V19M20 24V32M24 24V32M28 24V32" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Wrapper>
  )
}

/* ─────────────────────────────────────── */
/*  ClayCalendarIcon — amber calendar    */
/* ─────────────────────────────────────── */
export function ClayCalendarIcon({ size = 48, className = "", animate = true }: ClayIconProps) {
  const Wrapper = animate ? motion.div : "div"
  const props = animate ? { variants: clayFloat, initial: "initial", whileHover: "hover", whileTap: "tap" } : {}

  return (
    <Wrapper className={`inline-flex ${className}`} style={{ perspective: 400 }} {...(props as object)}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={uid("cal-bg")} cx="35%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
          <radialGradient id={uid("cal-shine")} cx="28%" cy="18%" r="52%">
            <stop offset="0%" stopColor="white" stopOpacity="0.42" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id={uid("cal-shadow")} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(217,119,6,0.35)" />
          </filter>
        </defs>
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("cal-bg")})`} filter={`url(#${uid("cal-shadow")})`} />
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("cal-shine")})`} />
        {/* Calendar frame */}
        <rect x="12" y="16" width="24" height="20" rx="3" stroke="white" strokeWidth="2.2" fill="none" />
        <path d="M12 21H36" stroke="white" strokeWidth="2.2" />
        {/* Pins */}
        <line x1="18" y1="12" x2="18" y2="19" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="30" y1="12" x2="30" y2="19" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        {/* Dots */}
        <circle cx="19" cy="27" r="1.4" fill="white" />
        <circle cx="24" cy="27" r="1.4" fill="white" />
        <circle cx="29" cy="27" r="1.4" fill="white" />
        <circle cx="19" cy="32" r="1.4" fill="white" />
        <circle cx="24" cy="32" r="1.4" fill="white" />
      </svg>
    </Wrapper>
  )
}

/* ─────────────────────────────────────── */
/*  ClayChartIcon — emerald analytics    */
/* ─────────────────────────────────────── */
export function ClayChartIcon({ size = 48, className = "", animate = true }: ClayIconProps) {
  const Wrapper = animate ? motion.div : "div"
  const props = animate ? { variants: clayFloat, initial: "initial", whileHover: "hover", whileTap: "tap" } : {}

  return (
    <Wrapper className={`inline-flex ${className}`} style={{ perspective: 400 }} {...(props as object)}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={uid("chart-bg")} cx="35%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
          <radialGradient id={uid("chart-shine")} cx="28%" cy="18%" r="52%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id={uid("chart-shadow")} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(5,150,105,0.35)" />
          </filter>
        </defs>
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("chart-bg")})`} filter={`url(#${uid("chart-shadow")})`} />
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("chart-shine")})`} />
        {/* Bars */}
        <rect x="13" y="27" width="5" height="8" rx="2" fill="white" fillOpacity="0.85" />
        <rect x="21" y="21" width="5" height="14" rx="2" fill="white" fillOpacity="0.85" />
        <rect x="29" y="15" width="5" height="20" rx="2" fill="white" fillOpacity="0.85" />
        {/* Trend line */}
        <path d="M15.5 27L23.5 21L31.5 15" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2" />
      </svg>
    </Wrapper>
  )
}

/* ─────────────────────────────────────── */
/*  ClayBotIcon — violet AI assistant    */
/* ─────────────────────────────────────── */
export function ClayBotIcon({ size = 48, className = "", animate = true }: ClayIconProps) {
  const Wrapper = animate ? motion.div : "div"
  const props = animate ? { variants: clayFloat, initial: "initial", whileHover: "hover", whileTap: "tap" } : {}

  return (
    <Wrapper className={`inline-flex ${className}`} style={{ perspective: 400 }} {...(props as object)}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={uid("bot-bg")} cx="35%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#6D28D9" />
          </radialGradient>
          <radialGradient id={uid("bot-shine")} cx="28%" cy="18%" r="52%">
            <stop offset="0%" stopColor="white" stopOpacity="0.38" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id={uid("bot-shadow")} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(109,40,217,0.35)" />
          </filter>
        </defs>
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("bot-bg")})`} filter={`url(#${uid("bot-shadow")})`} />
        <rect x="4" y="4" width="40" height="40" rx="14" fill={`url(#${uid("bot-shine")})`} />
        {/* Head */}
        <rect x="13" y="17" width="22" height="16" rx="5" stroke="white" strokeWidth="2" fill="none" />
        {/* Eyes */}
        <circle cx="20" cy="25" r="2.2" fill="white" />
        <circle cx="28" cy="25" r="2.2" fill="white" />
        {/* Antenna */}
        <line x1="24" y1="12" x2="24" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="11" r="2" fill="white" />
        {/* Ears */}
        <line x1="13" y1="24" x2="10" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="24" x2="38" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </Wrapper>
  )
}

/* ── Convenience re-export of all icons ── */
export const ClayIcons = {
  Check:    ClayCheckIcon,
  Plus:     ClayPlusIcon,
  Trash:    ClayTrashIcon,
  Calendar: ClayCalendarIcon,
  Chart:    ClayChartIcon,
  Bot:      ClayBotIcon,
} as const
