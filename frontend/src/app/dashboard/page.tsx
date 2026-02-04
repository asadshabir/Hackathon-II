"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { GlassCard } from "@/components/ui/glass-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { CheckSquare, User, Mail, Calendar, ArrowRight, MessageSquare, Bot } from "lucide-react"

/**
 * Dashboard Page
 *
 * Protected dashboard showing user information and quick access to todos
 * Premium clean design without heavy animations
 */

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="relative min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome Back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Ready to be productive today?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI Chat - Primary Feature */}
          <div className="md:col-span-2">
            <Link href="/dashboard/chat">
              <GlassCard className="cursor-pointer group relative overflow-hidden hover:shadow-xl transition-shadow duration-150">
                {/* Premium accent bar */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600" />
                <div className="p-8">
                <div className="relative flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Bot className="w-9 h-9 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">AI Task Assistant</h3>
                        <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Powered by Gemini AI</p>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md">
                      Manage your tasks using natural language. Just tell me what you need - create tasks, mark them complete, or get an overview of your day.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Add task", "Show pending", "Mark complete", "Delete tasks"].map((cmd) => (
                        <span key={cmd} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                          {cmd}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-indigo-500 transition-colors duration-150">
                    <ArrowRight className="w-10 h-10" />
                  </div>
                </div>
                </div>
              </GlassCard>
            </Link>
          </div>

          {/* Profile Card */}
          <div>
            <GlassCard className="h-full overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h3>
                </div>

                <div className="space-y-3 pt-2">
                  {user?.email && (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <Mail className="w-4 h-4 text-indigo-500" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Go to Todos */}
          <div>
            <Link href="/dashboard/todos">
              <GlassCard className="p-6 cursor-pointer group border-l-4 border-l-emerald-500 hover:shadow-xl transition-all duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                      <CheckSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Tasks</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        View and manage all your todos
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-150" />
                </div>
              </GlassCard>
            </Link>
          </div>

          {/* Chat History */}
          <div>
            <Link href="/dashboard/chat">
              <GlassCard className="p-6 cursor-pointer group border-l-4 border-l-indigo-500 hover:shadow-xl transition-all duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Conversations</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        View your chat history
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-150" />
                </div>
              </GlassCard>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">What You Can Do</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Natural Language",
                  description: "Tell the AI what you need in plain English",
                  bgClass: "bg-indigo-50 dark:bg-indigo-950/30",
                  accent: "bg-indigo-500",
                },
                {
                  title: "Smart Task Creation",
                  description: "AI understands context and creates tasks automatically",
                  bgClass: "bg-blue-50 dark:bg-blue-950/30",
                  accent: "bg-blue-500",
                },
                {
                  title: "Conversation Memory",
                  description: "Continue where you left off with chat history",
                  bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
                  accent: "bg-emerald-500",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-150`}
                >
                  <div className={`h-0.5 ${feature.accent}`} />
                  <div className={`p-6 ${feature.bgClass}`}>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/dashboard/chat">
            <AnimatedButton variant="primary" className="text-lg px-8 py-4 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30">
              Start Chatting with AI
              <Bot className="w-5 h-5 ml-2" />
            </AnimatedButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
