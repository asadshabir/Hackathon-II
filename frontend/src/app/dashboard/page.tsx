"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import {
  Bot, CheckSquare, MessageSquare, BarChart3,
  CalendarDays, Settings, ArrowRight, Zap, Clock, Star,
} from "lucide-react"

/**
 * Dashboard Home — Deep Indigo
 * Clean professional layout with indigo primary and semantic accents.
 */

const quickCards = [
  {
    label: "My Tasks",
    desc: "View & manage todos",
    href: "/dashboard/todos",
    icon: CheckSquare,
    color: "#10B981",
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.15)",
  },
  {
    label: "Analytics",
    desc: "Productivity insights",
    href: "/dashboard/analytics",
    icon: BarChart3,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.15)",
  },
  {
    label: "Calendar",
    desc: "Due dates",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.10)",
    border: "rgba(56,189,248,0.15)",
  },
  {
    label: "Conversations",
    desc: "Chat history",
    href: "/dashboard/chat",
    icon: MessageSquare,
    color: "#6366F1",
    bg: "rgba(99,102,241,0.10)",
    border: "rgba(99,102,241,0.15)",
  },
  {
    label: "Settings",
    desc: "Preferences",
    href: "/dashboard/settings",
    icon: Settings,
    color: "rgba(255,255,255,0.45)",
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.08)",
  },
]

const features = [
  { icon: Zap,   color: "#6366F1", label: "Natural Language",   desc: "Just type what you need" },
  { icon: Clock, color: "#38BDF8", label: "Smart Reminders",    desc: "Never miss a deadline"  },
  { icon: Star,  color: "#F59E0B", label: "Memory",             desc: "Picks up where you left off" },
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
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            Hey, <span className="gradient-violet-cyan">{firstName}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.42)" }}>
            Ready to crush your tasks today?
          </p>
        </div>

        {/* AI Chat hero card */}
        <Link href="/dashboard/chat">
          <div
            className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 active:scale-[0.985] transition-transform duration-150"
            style={{
              background: "linear-gradient(135deg, #0F1021 0%, #111318 100%)",
              boxShadow: "0 0 0 1px rgba(99,102,241,0.2), 0 4px 24px rgba(0,0,0,0.5)",
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                boxShadow: "0 0 20px rgba(99,102,241,0.30)",
              }}
            >
              <Bot className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-white text-base leading-tight">AI Task Assistant</p>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(99,102,241,0.18)",
                    color: "#818CF8",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                >
                  Gemini
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                Manage tasks using natural language — create, complete, delete &amp; more
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {["Add task", "Show pending", "Mark done"].map((cmd) => (
                  <span
                    key={cmd}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      border: "1px solid rgba(99,102,241,0.22)",
                      color: "rgba(129,140,248,0.80)",
                      background: "rgba(99,102,241,0.08)",
                    }}
                  >
                    {cmd}
                  </span>
                ))}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 shrink-0" style={{ color: "#818CF8" }} strokeWidth={2.5} />

            {/* Decorative ambient glow */}
            <div
              className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-10"
              style={{ background: "#6366F1" }}
            />
          </div>
        </Link>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.href + card.label} href={card.href}>
                <div
                  className="rounded-2xl p-4 flex flex-col gap-3 min-h-[100px] active:scale-[0.97] transition-transform duration-150"
                  style={{
                    background: "#111318",
                    boxShadow: `0 0 0 1px ${card.border}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: card.bg }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: card.color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight" style={{ color: "rgba(255,255,255,0.88)" }}>
                      {card.label}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
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
            background: "#111318",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
            Capabilities
          </p>
          <div className="grid grid-cols-3 gap-2">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.label} className="flex flex-col items-center text-center gap-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}22` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: f.color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold leading-tight" style={{ color: "rgba(255,255,255,0.72)" }}>
                      {f.label}
                    </p>
                    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "rgba(255,255,255,0.30)" }}>
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
