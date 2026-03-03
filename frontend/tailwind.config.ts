import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Shadcn / CSS-var token bridge ──────────────── */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "rgba(255,255,255,0.08)",
        input:  "rgba(255,255,255,0.06)",
        ring:   "hsl(var(--ring))",

        /* ── AMOLED Surface Levels ──────────────────────── */
        amoled: {
          black:    "#000000",
          surface:  "#0D0D0D",
          surface2: "#141414",
          surface3: "#1C1C1C",
        },

        /* ── 16M Electric Accent Colors ─────────────────── */
        violet:  { DEFAULT: "#8B5CF6", light: "#A78BFA", dark: "#7C3AED", glow: "rgba(139,92,246,0.25)" },
        cyan:    { DEFAULT: "#06B6D4", light: "#22D3EE", dark: "#0891B2", glow: "rgba(6,182,212,0.25)" },
        emerald: { DEFAULT: "#10B981", light: "#34D399", dark: "#059669", glow: "rgba(16,185,129,0.25)" },
        rose:    { DEFAULT: "#F43F5E", light: "#FB7185", dark: "#E11D48", glow: "rgba(244,63,94,0.25)" },
        amber:   { DEFAULT: "#F59E0B", light: "#FCD34D", dark: "#D97706", glow: "rgba(245,158,11,0.25)" },
        pink:    { DEFAULT: "#EC4899", light: "#F472B6", dark: "#DB2777", glow: "rgba(236,72,153,0.25)" },

        /* ── Priority semantic ──────────────────────────── */
        priority: {
          high:   "#F43F5E",
          medium: "#F59E0B",
          low:    "#10B981",
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },

      borderRadius: {
        "3xl": "24px",
        "2xl": "20px",
        xl:    "16px",
        lg:    "12px",
        md:    "8px",
        sm:    "4px",
      },

      boxShadow: {
        /* AMOLED neon glow */
        "glow-violet":  "0 0 0 1px rgba(139,92,246,0.3), 0 4px 32px rgba(139,92,246,0.2)",
        "glow-cyan":    "0 0 0 1px rgba(6,182,212,0.3),  0 4px 32px rgba(6,182,212,0.2)",
        "glow-emerald": "0 0 0 1px rgba(16,185,129,0.3), 0 4px 32px rgba(16,185,129,0.2)",
        "glow-rose":    "0 0 0 1px rgba(244,63,94,0.3),  0 4px 32px rgba(244,63,94,0.2)",
        "glow-amber":   "0 0 0 1px rgba(245,158,11,0.3), 0 4px 32px rgba(245,158,11,0.2)",

        /* Elevation */
        "amoled-sm": "0 2px 8px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)",
        "amoled-md": "0 4px 20px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.05)",
        "amoled-lg": "0 8px 40px rgba(0,0,0,1), 0 0 0 1px rgba(255,255,255,0.06)",

        /* Light mode */
        card:      "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
        neu:       "8px 8px 16px rgba(163,177,198,0.35), -8px -8px 16px rgba(255,255,255,0.9)",
        neuInner:  "inset 4px 4px 8px rgba(163,177,198,0.35), inset -4px -4px 8px rgba(255,255,255,0.9)",
        neuHover:  "6px 6px 12px rgba(163,177,198,0.35), -6px -6px 12px rgba(255,255,255,0.9)",
        neuActive: "inset 2px 2px 4px rgba(163,177,198,0.3), inset -2px -2px 4px rgba(255,255,255,0.8)",
        lifted:    "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.06)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 8px rgba(139,92,246,0.4)" },
          "50%":      { boxShadow: "0 0 24px rgba(139,92,246,0.85)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "slide-up":       "slide-up 0.3s ease-out forwards",
        "glow-pulse":     "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
