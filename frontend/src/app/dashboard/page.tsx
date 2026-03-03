"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import {
  Bot, CheckSquare, MessageSquare, BarChart3,
  CalendarDays, Settings, ArrowRight, Zap, Clock, Star,
} from "lucide-react"

/**
 * Dashboard Home — AMOLED mobile-first
 * 2-col grid on mobile, 3-col on desktop.
 * Electric color accents with HD icon pills.
 */

const quickCards = [
  {
    label: "My Tasks",
    desc: "View & manage todos",
    href: "/dashboard/todos",
    icon: CheckSquare,
    color: "#10B981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.2)",
  },
  {
    label: "Analytics",
    desc: "Productivity insights",
    href: "/dashboard/analytics",
    icon: BarChart3,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    label: "Calendar",
    desc: "Due dates",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.12)",
    border: "rgba(6,182,212,0.2)",
  },
  {
    label: "Conversations",
    desc: "Chat history",
    href: "/dashboard/chat",
    icon: MessageSquare,
    color: "#EC4899",
    bg: "rgba(236,72,153,0.12)",
    border: "rgba(236,72,153,0.2)",
  },
  {
    label: "Settings",
    desc: "Preferences",
    href: "/dashboard/settings",
    icon: Settings,
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.15)",
  },
]

const features = [
  { icon: Zap,   color: "#8B5CF6", label: "Natural Language",    desc: "Just type what you need" },
  { icon: Clock, color: "#06B6D4", label: "Smart Reminders",     desc: "Never miss a deadline"  },
  { icon: Star,  color: "#F59E0B", label: "Memory",              desc: "Picks up where you left off" },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there"

  return (
    <div className="min-h-screen pt-5 pb-2 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Greeting */}
        <div className="px-1">
          <p className="text-xs font-medium text-white/35 mb-0.5 uppercase tracking-widest">Dashboard</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            Hey, <span className="gradient-violet-cyan">{firstName}</span> 👋
          </h1>
          <p className="text-sm text-white/40 mt-1">Ready to crush your tasks today?</p>
        </div>

        {/* AI Chat — hero card */}
        <Link href="/dashboard/chat">
          <div
            className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 active:scale-[0.985] transition-transform duration-150"
            style={{
              background: "linear-gradient(135deg, #1C0F3A 0%, #0D0D1A 100%)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.25), 0 8px 40px rgba(139,92,246,0.2)",
            }}
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #9333EA)",
                boxShadow: "0 0 20px rgba(139,92,246,0.5)",
              }}
            >
              <Bot className="w-8 h-8 text-white" strokeWidth={1.8} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-white text-base leading-tight">AI Task Assistant</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/25 text-violet-300 border border-violet-500/25">
                  Gemini
                </span>
              </div>
              <p className="text-xs text-white/45 leading-relaxed">
                Manage tasks using natural language — create, complete, delete & more
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {["Add task", "Show pending", "Mark done"].map((cmd) => (
                  <span
                    key={cmd}
                    className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                    style={{ borderColor: "rgba(139,92,246,0.25)", color: "rgba(167,139,250,0.8)", background: "rgba(139,92,246,0.08)" }}
                  >
                    {cmd}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-5 h-5 text-violet-400 shrink-0" strokeWidth={2.5} />

            {/* Decorative blob */}
            <div
              className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-15 blur-3xl pointer-events-none"
              style={{ background: "#8B5CF6" }}
            />
          </div>
        </Link>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.href + card.label} href={card.href}>
                <div
                  className="rounded-2xl p-4 flex flex-col gap-3 min-h-[100px] active:scale-[0.97] transition-transform duration-150"
                  style={{
                    background: "#0F0F0F",
                    boxShadow: `0 0 0 1px ${card.border}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: card.bg, boxShadow: `0 0 0 1px ${card.border}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90 leading-tight">{card.label}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">{card.desc}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Feature row */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "#0A0A0A", boxShadow: "0 0 0 1px rgba(255,255,255,0.04)" }}
        >
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Capabilities</p>
          <div className="grid grid-cols-3 gap-2">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.label} className="flex flex-col items-center text-center gap-2">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: `${f.color}18`, boxShadow: `0 0 0 1px ${f.color}28` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: f.color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white/75 leading-tight">{f.label}</p>
                    <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{f.desc}</p>
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
