"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import {
  Bot, CheckSquare, MessageSquare, BarChart3,
  CalendarDays, Settings, ArrowRight, Zap, Clock, Star,
} from "lucide-react"

/**
 * Dashboard Home — Colorful + 3D animated
 */

const quickCards = [
  {
    label: "My Tasks",
    desc: "View & manage todos",
    href: "/dashboard/todos",
    icon: CheckSquare,
    color: "#10B981",
    gradFrom: "rgba(16,185,129,0.18)",
    gradTo: "rgba(16,185,129,0.04)",
    glow: "rgba(16,185,129,0.22)",
    border: "rgba(16,185,129,0.28)",
  },
  {
    label: "Analytics",
    desc: "Productivity insights",
    href: "/dashboard/analytics",
    icon: BarChart3,
    color: "#F59E0B",
    gradFrom: "rgba(245,158,11,0.18)",
    gradTo: "rgba(245,158,11,0.04)",
    glow: "rgba(245,158,11,0.22)",
    border: "rgba(245,158,11,0.28)",
  },
  {
    label: "Calendar",
    desc: "Due dates",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    color: "#38BDF8",
    gradFrom: "rgba(56,189,248,0.18)",
    gradTo: "rgba(56,189,248,0.04)",
    glow: "rgba(56,189,248,0.22)",
    border: "rgba(56,189,248,0.28)",
  },
  {
    label: "Conversations",
    desc: "Chat history",
    href: "/dashboard/chat",
    icon: MessageSquare,
    color: "#A78BFA",
    gradFrom: "rgba(167,139,250,0.18)",
    gradTo: "rgba(167,139,250,0.04)",
    glow: "rgba(167,139,250,0.22)",
    border: "rgba(167,139,250,0.28)",
  },
  {
    label: "Settings",
    desc: "Preferences",
    href: "/dashboard/settings",
    icon: Settings,
    color: "#94A3B8",
    gradFrom: "rgba(148,163,184,0.14)",
    gradTo: "rgba(148,163,184,0.03)",
    glow: "rgba(148,163,184,0.15)",
    border: "rgba(148,163,184,0.20)",
  },
]

const features = [
  { icon: Zap,   color: "#A78BFA", bg: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.25)", label: "Natural Language",   desc: "Just type what you need",        delay: "0s"    },
  { icon: Clock, color: "#38BDF8", bg: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.25)",  label: "Smart Reminders",    desc: "Never miss a deadline",          delay: "0.1s"  },
  { icon: Star,  color: "#FBBF24", bg: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.25)",  label: "Memory",             desc: "Picks up where you left off",   delay: "0.2s"  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there"

  return (
    <div className="min-h-screen pt-5 pb-2 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Greeting */}
        <div className="px-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
            Dashboard
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Hey, <span style={{
              background: "linear-gradient(135deg, #A78BFA 0%, #38BDF8 50%, #34D399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>{firstName}</span> 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.42)" }}>
            Ready to crush your tasks today?
          </p>
        </div>

        {/* AI Chat hero card */}
        <Link href="/dashboard/chat">
          <div
            className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 shimmer-card transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.985]"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(167,139,250,0.12) 50%, rgba(56,189,248,0.08) 100%)",
              boxShadow: "0 0 0 1px rgba(99,102,241,0.30), 0 8px 32px rgba(99,102,241,0.20)",
            }}
          >
            {/* Decorative orbs */}
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: "#6366F1", opacity: 0.20 }} />
            <div className="absolute -bottom-8 right-16 w-24 h-24 rounded-full blur-3xl pointer-events-none" style={{ background: "#38BDF8", opacity: 0.15 }} />

            {/* Icon */}
            <div
              className="relative w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 icon-3d icon-float"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                boxShadow: "0 0 24px rgba(99,102,241,0.50), 0 4px 12px rgba(0,0,0,0.4)",
              }}
            >
              <Bot className="w-6 h-6 text-white" strokeWidth={1.8} style={{ filter: "drop-shadow(0 2px 6px rgba(255,255,255,0.3))" }} />
            </div>

            {/* Text */}
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-black text-white text-base leading-tight">AI Task Assistant</p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(167,139,250,0.20)", color: "#C4B5FD", border: "1px solid rgba(167,139,250,0.30)" }}
                >
                  Gemini
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>
                Manage tasks using natural language — create, complete, delete &amp; more
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {["Add task", "Show pending", "Mark done"].map((cmd) => (
                  <span
                    key={cmd}
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ border: "1px solid rgba(99,102,241,0.30)", color: "#A5B4FC", background: "rgba(99,102,241,0.12)" }}
                  >
                    {cmd}
                  </span>
                ))}
              </div>
            </div>

            <ArrowRight className="relative w-4 h-4 shrink-0" style={{ color: "#818CF8" }} strokeWidth={2.5} />
          </div>
        </Link>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.href} href={card.href}>
                <div
                  className="relative overflow-hidden rounded-2xl p-4 flex flex-col gap-3 min-h-[108px] shimmer-card transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.97]"
                  style={{
                    background: `linear-gradient(135deg, ${card.gradFrom} 0%, ${card.gradTo} 100%)`,
                    boxShadow: `0 0 0 1px ${card.border}, 0 4px 20px ${card.glow}`,
                  }}
                >
                  {/* Ambient blob */}
                  <div
                    className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl pointer-events-none"
                    style={{ background: card.color, opacity: 0.20 }}
                  />

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center icon-3d icon-float"
                    style={{
                      background: `linear-gradient(135deg, ${card.color}30, ${card.color}15)`,
                      boxShadow: `0 4px 12px ${card.color}35, 0 0 0 1px ${card.color}22`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: card.color, filter: `drop-shadow(0 2px 6px ${card.color}80)` }}
                      strokeWidth={2}
                    />
                  </div>

                  <div className="relative">
                    <p className="text-sm font-bold leading-tight" style={{ color: "rgba(255,255,255,0.90)" }}>
                      {card.label}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Capabilities row */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(56,189,248,0.04) 100%)",
            boxShadow: "0 0 0 1px rgba(99,102,241,0.15)",
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.28)" }}>
            Capabilities
          </p>
          <div className="grid grid-cols-3 gap-2">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.label} className="flex flex-col items-center text-center gap-2">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center icon-3d icon-float"
                    style={{
                      background: f.bg,
                      border: `1px solid ${f.border}`,
                      boxShadow: `0 4px 12px ${f.color}25`,
                      animationDelay: f.delay,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: f.color, filter: `drop-shadow(0 2px 8px ${f.color}70)` }}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-tight" style={{ color: "rgba(255,255,255,0.80)" }}>
                      {f.label}
                    </p>
                    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "rgba(255,255,255,0.32)" }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
