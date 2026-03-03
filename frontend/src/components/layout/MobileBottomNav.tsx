"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react"

/**
 * MobileBottomNav
 *
 * iOS/Android native-style bottom tab bar.
 * Only visible on mobile (md:hidden).
 * AMOLED-optimised: true black, electric glow on active tab.
 */

const tabs = [
  { label: "Home",      href: "/dashboard",            icon: LayoutDashboard, color: "#8B5CF6" },
  { label: "Tasks",     href: "/dashboard/todos",       icon: ListTodo,        color: "#10B981" },
  { label: "Chat",      href: "/dashboard/chat",        icon: MessageSquare,   color: "#06B6D4" },
  { label: "Analytics", href: "/dashboard/analytics",   icon: BarChart3,       color: "#F59E0B" },
  { label: "Settings",  href: "/dashboard/settings",    icon: Settings,        color: "#EC4899" },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="
        md:hidden fixed bottom-0 left-0 right-0 z-50
        bg-black/95 border-t border-white/[0.06]
        flex items-stretch
      "
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = pathname === tab.href ||
          (tab.href !== "/dashboard" && pathname.startsWith(tab.href))

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] relative tap-target"
            aria-current={isActive ? "page" : undefined}
          >
            {/* Active glow pill behind icon */}
            {isActive && (
              <span
                className="absolute top-1 w-10 h-8 rounded-xl opacity-20"
                style={{ backgroundColor: tab.color }}
              />
            )}

            {/* Icon */}
            <Icon
              className="relative w-6 h-6 transition-all duration-200"
              style={{
                color: isActive ? tab.color : "rgba(255,255,255,0.38)",
                filter: isActive ? `drop-shadow(0 0 6px ${tab.color})` : "none",
                transform: isActive ? "scale(1.1)" : "scale(1)",
              }}
              strokeWidth={isActive ? 2.5 : 1.8}
            />

            {/* Label */}
            <span
              className="text-[10px] font-medium tracking-wide transition-colors duration-200"
              style={{
                color: isActive ? tab.color : "rgba(255,255,255,0.38)",
              }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
