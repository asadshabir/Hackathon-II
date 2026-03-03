"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ListTodo, MessageSquare, BarChart3, Settings,
} from "lucide-react"

/**
 * MobileBottomNav — Deep Indigo
 *
 * Single indigo active state for a clean, professional look.
 * Only visible on mobile (md:hidden).
 */

const tabs = [
  { label: "Home",      href: "/dashboard",           icon: LayoutDashboard },
  { label: "Tasks",     href: "/dashboard/todos",      icon: ListTodo        },
  { label: "Chat",      href: "/dashboard/chat",       icon: MessageSquare   },
  { label: "Analytics", href: "/dashboard/analytics",  icon: BarChart3       },
  { label: "Settings",  href: "/dashboard/settings",   icon: Settings        },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: "rgba(10,11,15,0.96)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/dashboard" && pathname.startsWith(tab.href))

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] relative tap-target"
            aria-current={isActive ? "page" : undefined}
          >
            {/* Active indicator pill */}
            {isActive && (
              <span
                className="absolute top-1.5 w-8 h-7 rounded-xl"
                style={{ background: "rgba(99,102,241,0.18)" }}
              />
            )}

            <Icon
              className="relative w-5 h-5 transition-all duration-200"
              style={{
                color: isActive ? "#818CF8" : "rgba(255,255,255,0.35)",
                transform: isActive ? "scale(1.05)" : "scale(1)",
              }}
              strokeWidth={isActive ? 2.5 : 1.8}
            />

            <span
              className="text-[10px] font-medium tracking-wide transition-colors duration-200"
              style={{
                color: isActive ? "#818CF8" : "rgba(255,255,255,0.35)",
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
