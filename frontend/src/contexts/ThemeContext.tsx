"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type Theme = "dark"

interface ThemeContextType {
  theme: Theme
  // Keeping toggleTheme for potential future use, but it won't change the theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  // Only set dark theme, no more light theme
  useEffect(() => {
    setMounted(true)
    // Always set to dark theme
    setTheme("dark")
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add("dark")
    localStorage.setItem("theme", "dark")
  }, [mounted])

  const toggleTheme = () => {
    // No-op function since we're only supporting dark mode
    console.log("Theme toggle disabled - only dark mode is available")
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
