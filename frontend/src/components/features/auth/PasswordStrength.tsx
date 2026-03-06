"use client"

/**
 * PasswordStrength Component
 *
 * Visual indicator showing password strength with 4-level bars
 * Colors: weak (gray), fair (red), good (yellow), strong (green)
 */

import { calculatePasswordStrength } from "@/schemas/auth"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = calculatePasswordStrength(password)

  // Map strength to number of bars (0-4)
  const strengthLevel = {
    weak: 0,
    fair: 1,
    good: 2,
    strong: 3,
  }[strength]

  const colorMap = {
    weak:   { bar: "#3F3F46",   label: "rgba(255,255,255,0.30)", text: "Weak"   },
    fair:   { bar: "#EF4444",   label: "#F87171",                text: "Fair"   },
    good:   { bar: "#F59E0B",   label: "#FCD34D",                text: "Good"   },
    strong: { bar: "#10B981",   label: "#34D399",                text: "Strong" },
  }

  const current = colorMap[strength]

  if (!password) return null

  return (
    <div className="mt-2.5 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: index <= strengthLevel ? current.bar : "rgba(255,255,255,0.07)" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
        Strength:{" "}
        <span className="font-semibold" style={{ color: current.label }}>
          {current.text}
        </span>
      </p>
    </div>
  )
}
