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
        /* Shadcn CSS-var bridge */
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

        /* ── Light clay palette ── */
        bg: {
          50:  "var(--bg-50)",
          100: "var(--bg-100)",
        },
        clay: {
          surface: "var(--surface)",
          muted:   "var(--muted-bg)",
          glass:   "var(--glass)",
          text:    "var(--text)",
          "muted-text": "var(--muted-text)",
          primary: "var(--primary)",
          "primary-100": "var(--primary-100)",
          "primary-600": "var(--primary-600)",
          secondary: "var(--secondary)",
          accent:    "var(--accent)",
          success:   "var(--success)",
          warning:   "var(--warning)",
          danger:    "var(--danger)",
        },

        /* Deep Indigo surface system (dark) */
        surface: {
          bg:  "#0A0B0F",
          1:   "#111318",
          2:   "#181B23",
          3:   "#1F2330",
        },

        /* Primary indigo */
        indigo: {
          DEFAULT: "#6366F1",
          light:   "#818CF8",
          dark:    "#4F46E5",
          glow:    "rgba(99,102,241,0.25)",
        },

        /* Semantic status colors */
        emerald: { DEFAULT: "#10B981", light: "#34D399", dark: "#059669" },
        amber:   { DEFAULT: "#F59E0B", light: "#FCD34D", dark: "#D97706" },
        rose:    { DEFAULT: "#EF4444", light: "#F87171", dark: "#DC2626" },
        sky:     { DEFAULT: "#38BDF8", light: "#7DD3FC", dark: "#0284C7" },

        /* Priority semantic */
        priority: {
          urgent: "#EF4444",
          high:   "#F97316",
          medium: "#F59E0B",
          low:    "#10B981",
        },

        /* Legacy violet — mapped to indigo */
        violet: {
          DEFAULT: "#6366F1",
          light:   "#818CF8",
          dark:    "#4F46E5",
          glow:    "rgba(99,102,241,0.25)",
        },
        cyan: { DEFAULT: "#38BDF8", light: "#7DD3FC", dark: "#0284C7" },
        pink: { DEFAULT: "#EC4899", light: "#F472B6", dark: "#DB2777" },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },

      borderRadius: {
        "3xl": "24px",
        "2xl": "20px",
        xl: "16px",
        lg: "12px",
        md: "8px",
        sm: "4px",
      },

      boxShadow: {
        /* Primary CTA glow — only use on main action buttons */
        "glow-indigo": "0 0 20px rgba(99,102,241,0.30), 0 0 0 1px rgba(99,102,241,0.25)",
        "glow-violet": "0 0 20px rgba(99,102,241,0.30), 0 0 0 1px rgba(99,102,241,0.25)",

        /* Subtle glows for status chips (no border ring) */
        "glow-emerald": "0 4px 20px rgba(16,185,129,0.12)",
        "glow-rose":    "0 4px 20px rgba(239,68,68,0.12)",
        "glow-amber":   "0 4px 20px rgba(245,158,11,0.12)",
        "glow-sky":     "0 4px 20px rgba(56,189,248,0.12)",

        /* Surface elevation */
        "surface-sm": "0 1px 4px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
        "surface-md": "0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)",
        "surface-lg": "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",

        /* Light / clay mode */
        "float-md": "0 10px 30px rgba(99,102,241,0.14)",
        "float-sm": "0 6px 18px rgba(79,70,229,0.08)",
        "clay":     "0 10px 30px rgba(99,102,241,0.14), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(99,102,241,0.08)",
        "clay-lg":  "0 20px 48px rgba(99,102,241,0.18), 0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(99,102,241,0.12)",
        card:      "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
        neu:       "8px 8px 16px rgba(163,177,198,0.35), -8px -8px 16px rgba(255,255,255,0.9)",
        neuInner:  "inset 4px 4px 8px rgba(163,177,198,0.35), inset -4px -4px 8px rgba(255,255,255,0.9)",
        neuHover:  "6px 6px 12px rgba(163,177,198,0.35), -6px -6px 12px rgba(255,255,255,0.9)",
        lifted:    "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.06)",

        /* Legacy neumorphic — kept for light mode */
        "amoled-sm": "0 2px 8px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
        "amoled-md": "0 4px 16px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
        "amoled-lg": "0 8px 32px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.07)",
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
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 8px rgba(99,102,241,0.35)" },
          "50%":      { boxShadow: "0 0 20px rgba(99,102,241,0.70)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "slide-up":       "slide-up 0.25s ease-out forwards",
        "glow-pulse":     "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
