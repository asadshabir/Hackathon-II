"use client"

/**
 * AI Chat Page
 *
 * Premium AI-powered task management through natural conversation
 * Clean design without heavy animations
 */

import { ChatContainer } from "@/components/features/chat"

export default function ChatPage() {
  return (
    <div className="relative min-h-screen flex flex-col p-6">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
            AI Task Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Manage your tasks using natural language
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 min-h-0">
          <ChatContainer />
        </div>
      </div>
    </div>
  )
}
