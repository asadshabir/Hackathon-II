"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  CheckCircle2, Sparkles, Zap, Bot, Calendar,
  BarChart3, Bell, Repeat, Shield, ArrowRight, Check,
  TrendingUp, Users, Globe, Cpu,
} from "lucide-react"

/* ─── Scroll-reveal wrapper ─── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Animated counter ─── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 60
    const t = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(t) } else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(t)
  }, [inView, to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ─── Floating orb ─── */
function Orb({ color, size, top, left, delay = 0, blur = "blur-3xl" }: {
  color: string; size: string; top: string; left: string; delay?: number; blur?: string
}) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${blur}`}
      style={{ background: color, width: size, height: size, top, left }}
      animate={{ y: [0, -28, 0], x: [0, 14, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  )
}

/* ─── Mini task card for hero preview ─── */
function MiniTask({ title, priority, done, delay }: { title: string; priority: string; done?: boolean; delay: number }) {
  const colors: Record<string, string> = { urgent: "#EF4444", high: "#F97316", medium: "#F59E0B", low: "#10B981" }
  const c = colors[priority] ?? "#6366F1"
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${c}18 0%, rgba(17,19,24,0.95) 100%)`,
        boxShadow: `0 0 0 1px ${c}30, 0 8px 24px rgba(0,0,0,0.5)`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: done ? `linear-gradient(135deg,${c},${c}cc)` : `${c}20`, border: `1px solid ${c}50` }}
      >
        {done && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </div>
      <span className="text-sm font-medium flex-1" style={{ color: done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.88)", textDecoration: done ? "line-through" : "none" }}>
        {title}
      </span>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${c}20`, color: c, border: `1px solid ${c}35` }}>
        {priority}
      </span>
    </motion.div>
  )
}

/* ─── Feature card ─── */
const featureCards = [
  { icon: Bot,         color: "#818CF8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.22)", title: "AI Assistant",       desc: "Natural language task creation. Just describe what you need." },
  { icon: Bell,        color: "#FBBF24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.22)",  title: "Smart Reminders",    desc: "Never miss a deadline. Browser notifications at the right time." },
  { icon: BarChart3,   color: "#F97316", bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.22)",  title: "Deep Analytics",     desc: "Completion trends, priority breakdown, and productivity streaks." },
  { icon: Repeat,      color: "#34D399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.22)",  title: "Recurring Tasks",    desc: "Daily, weekly, monthly. Set it once, never worry again." },
  { icon: Calendar,    color: "#38BDF8", bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.22)",  title: "Calendar View",      desc: "See all your tasks laid out beautifully across the month." },
  { icon: Shield,      color: "#F472B6", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.22)", title: "Secure & Private",   desc: "JWT auth, encrypted storage. Your data stays yours." },
]

/* ─── Steps ─── */
const steps = [
  { num: "01", icon: CheckCircle2, color: "#818CF8", title: "Create Your Tasks",    desc: "Add tasks manually or just chat with the AI — 'Remind me to call John tomorrow at 3pm'." },
  { num: "02", icon: Sparkles,     color: "#34D399", title: "AI Organizes Them",    desc: "Priority, category, and reminders are set automatically. The AI understands context." },
  { num: "03", icon: TrendingUp,   color: "#FBBF24", title: "Track & Improve",      desc: "Analytics show your patterns. Streaks keep you motivated. You level up every day." },
]

/* ─── Stats ─── */
const stats = [
  { value: 10000, suffix: "+", label: "Tasks Completed", color: "#818CF8" },
  { value: 99,    suffix: "%", label: "Uptime",           color: "#34D399" },
  { value: 500,   suffix: "+", label: "Happy Users",      color: "#FBBF24" },
  { value: 3,     suffix: "x", label: "Faster Workflow",  color: "#38BDF8" },
]

/* ─── Main export ─── */
export function HeroSection() {
  return (
    <>
      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-4 pt-24 pb-16">
        {/* Animated background orbs */}
        <Orb color="rgba(99,102,241,0.28)"  size="600px" top="-10%"  left="-10%"  delay={0}   blur="blur-3xl" />
        <Orb color="rgba(167,139,250,0.20)" size="500px" top="20%"   left="55%"   delay={2}   blur="blur-3xl" />
        <Orb color="rgba(56,189,248,0.18)"  size="400px" top="55%"   left="5%"    delay={3.5} blur="blur-3xl" />
        <Orb color="rgba(52,211,153,0.14)"  size="350px" top="70%"   left="70%"   delay={1.5} blur="blur-3xl" />
        <Orb color="rgba(244,114,182,0.12)" size="300px" top="10%"   left="35%"   delay={4}   blur="blur-[80px]" />

        {/* Animated grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: text */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)" }}
              >
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#A5B4FC" }} />
                </motion.div>
                <span className="text-xs font-bold tracking-wide" style={{ color: "#A5B4FC" }}>Powered by Gemini AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-5"
              >
                <span className="text-white">Organize Smarter.</span>
                <br />
                <span style={{
                  background: "linear-gradient(135deg, #818CF8 0%, #A78BFA 30%, #38BDF8 60%, #34D399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>Work Faster.</span>
                <br />
                <span className="text-white/85">Live Better.</span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-lg mb-8 max-w-lg leading-relaxed"
                style={{ color: "rgba(255,255,255,0.50)" }}
              >
                The AI-powered todo app that understands natural language, sends smart reminders,
                and gives you deep productivity insights — all beautifully designed.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 mb-10"
              >
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(99,102,241,0.55)" }}
                    whileTap={{ scale: 0.97 }}
                    className="h-12 px-8 rounded-2xl text-sm font-black text-white flex items-center gap-2 min-w-[180px] justify-center"
                    style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", boxShadow: "0 0 20px rgba(99,102,241,0.35)" }}
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link href="/signin">
                  <motion.button
                    whileHover={{ scale: 1.03, background: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.97 }}
                    className="h-12 px-8 rounded-2xl text-sm font-semibold min-w-[140px]"
                    style={{ color: "rgba(255,255,255,0.68)", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}
                  >
                    Sign In
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-4"
              >
                {[
                  { icon: Shield,  color: "#34D399", text: "Free forever"     },
                  { icon: Zap,     color: "#FBBF24", text: "No credit card"   },
                  { icon: Globe,   color: "#38BDF8", text: "Open source"      },
                  { icon: Users,   color: "#F472B6", text: "500+ users"       },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <b.icon className="w-3.5 h-3.5" style={{ color: b.color }} />
                    <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.42)" }}>{b.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: floating task preview */}
            <div className="hidden lg:block relative">
              {/* Main card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-3xl p-5 space-y-2.5"
                style={{
                  background: "linear-gradient(135deg, rgba(17,19,24,0.98) 0%, rgba(10,11,15,0.98) 100%)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.12)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">My Tasks</p>
                    <p className="text-sm font-bold text-white/90">Today&apos;s Focus</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.22)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400">3 Done</span>
                  </div>
                </div>

                <MiniTask title="Design landing page"        priority="urgent" done  delay={0.6} />
                <MiniTask title="Review pull requests"       priority="high"         delay={0.75} />
                <MiniTask title="Team standup call"          priority="medium" done  delay={0.9} />
                <MiniTask title="Write weekly report"        priority="high"         delay={1.05} />
                <MiniTask title="Update dependencies"        priority="low"    done  delay={1.2} />

                {/* AI suggestion chip */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl mt-2"
                  style={{ background: "rgba(129,140,248,0.10)", border: "1px solid rgba(129,140,248,0.20)" }}
                >
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                    <span className="text-indigo-300 font-semibold">AI:</span> You have 2 high-priority tasks pending.
                  </p>
                </motion.div>
              </motion.div>

              {/* Floating stat chips */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-8 px-4 py-2.5 rounded-2xl"
                style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.28)", backdropFilter: "blur(12px)" }}
              >
                <p className="text-[10px] font-bold text-amber-300/70 uppercase tracking-wider">Streak</p>
                <p className="text-2xl font-black text-amber-300">12 🔥</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-10 px-4 py-2.5 rounded-2xl"
                style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.28)", backdropFilter: "blur(12px)" }}
              >
                <p className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-wider">This Week</p>
                <p className="text-2xl font-black text-emerald-300">87%</p>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS SECTION
      ══════════════════════════════════════════ */}
      <section className="relative py-16 px-4">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.05) 50%, transparent 100%)" }}
        />
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.04, y: -4 }}
                  className="relative overflow-hidden rounded-2xl p-5 text-center shimmer-card"
                  style={{
                    background: `linear-gradient(135deg, ${s.color}18 0%, rgba(17,19,24,1) 100%)`,
                    boxShadow: `0 0 0 1px ${s.color}28, 0 8px 24px ${s.color}12`,
                  }}
                >
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl" style={{ background: s.color, opacity: 0.2 }} />
                  <p className="text-3xl md:text-4xl font-black mb-1" style={{ color: s.color, textShadow: `0 0 20px ${s.color}55` }}>
                    <Counter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.40)" }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════ */}
      <section id="features" className="relative py-20 px-4">
        <Orb color="rgba(52,211,153,0.12)"  size="500px" top="10%"  left="-10%" delay={0} />
        <Orb color="rgba(244,114,182,0.10)" size="400px" top="50%"  left="60%"  delay={2} />

        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#818CF8" }}>Features</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Everything you need to{" "}
              <span style={{
                background: "linear-gradient(135deg, #818CF8 0%, #34D399 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>stay on top</span>
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.42)" }}>
              Built with the features that actually matter — no bloat, just productivity.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureCards.map((f, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="relative overflow-hidden rounded-2xl p-5 h-full shimmer-card"
                  style={{
                    background: `linear-gradient(135deg, ${f.bg} 0%, rgba(17,19,24,0.98) 100%)`,
                    boxShadow: `0 0 0 1px ${f.border}, 0 8px 24px rgba(0,0,0,0.4)`,
                  }}
                >
                  {/* Corner orb */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl" style={{ background: f.color, opacity: 0.15 }} />

                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 icon-3d icon-float"
                    style={{
                      background: `linear-gradient(135deg, ${f.color}30, ${f.color}15)`,
                      boxShadow: `0 4px 16px ${f.color}35, 0 0 0 1px ${f.color}25`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color, filter: `drop-shadow(0 2px 8px ${f.color}70)` }} strokeWidth={2} />
                  </div>

                  <h3 className="text-sm font-bold text-white/90 mb-2">{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>{f.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-20 px-4">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(129,140,248,0.04) 50%, transparent 100%)" }}
        />

        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FBBF24" }}>How It Works</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Up and running in{" "}
              <span style={{
                background: "linear-gradient(135deg, #FBBF24 0%, #F97316 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>30 seconds</span>
            </h2>
            <p className="text-base max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.42)" }}>
              No setup required. Create an account and the AI does the rest.
            </p>
          </FadeUp>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-px"
              style={{ background: "linear-gradient(90deg, rgba(129,140,248,0.5), rgba(52,211,153,0.5), rgba(251,191,36,0.5))" }} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <FadeUp key={i} delay={i * 0.15}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="relative flex flex-col items-center text-center"
                  >
                    {/* Number bubble */}
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5 icon-3d"
                      style={{
                        background: `linear-gradient(135deg, ${s.color}25, ${s.color}12)`,
                        boxShadow: `0 0 0 1px ${s.color}35, 0 8px 24px ${s.color}25`,
                      }}
                    >
                      <s.icon className="w-7 h-7" style={{ color: s.color, filter: `drop-shadow(0 2px 12px ${s.color}80)` }} strokeWidth={1.8} />
                      <span
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center"
                        style={{ background: s.color, color: "#000", boxShadow: `0 0 12px ${s.color}70` }}
                      >
                        {i + 1}
                      </span>
                    </motion.div>

                    <h3 className="text-base font-bold text-white/90 mb-2">{s.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>{s.desc}</p>
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════ */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(124,58,237,0.12) 50%, rgba(56,189,248,0.10) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(10,11,15,0.5) 100%)" }} />
        <Orb color="rgba(99,102,241,0.35)"  size="500px" top="-20%" left="-5%"  delay={0} />
        <Orb color="rgba(56,189,248,0.25)"  size="400px" top="30%"  left="65%"  delay={2} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeUp>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-6 mx-auto"
              style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)", boxShadow: "0 0 32px rgba(99,102,241,0.50)" }}
            >
              <Cpu className="w-8 h-8 text-white" strokeWidth={1.5} />
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
              Start organizing{" "}
              <span style={{
                background: "linear-gradient(135deg, #A78BFA 0%, #38BDF8 60%, #34D399 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>smarter today.</span>
            </h2>
            <p className="text-base md:text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.50)" }}>
              Join hundreds of users who&apos;ve already leveled up their productivity with TaskFlow AI.
              It&apos;s completely free to get started.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(99,102,241,0.60)" }}
                  whileTap={{ scale: 0.97 }}
                  className="h-13 px-10 rounded-2xl text-base font-black text-white flex items-center gap-2 mx-auto sm:mx-0 h-12"
                  style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)", boxShadow: "0 0 24px rgba(99,102,241,0.40)" }}
                >
                  <Sparkles className="w-4 h-4" />
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/signin">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-12 px-8 rounded-2xl text-sm font-semibold"
                  style={{ color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)" }}
                >
                  Already have an account
                </motion.button>
              </Link>
            </div>

            {/* Feature checklist */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8">
              {["No credit card", "Free forever", "Cancel anytime", "Open source"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{t}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
