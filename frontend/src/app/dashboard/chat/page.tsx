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
    <div className="flex flex-col h-[calc(100vh-56px)] pt-4 px-0 md:px-2">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col gap-3 min-h-0 px-4">
        {/* Header */}
        <div>
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-0.5">AI Assistant</p>
          <h1 className="text-xl font-bold text-white leading-tight">
            <span className="gradient-violet-cyan">AI Task Assistant</span>
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Powered by Gemini · manage tasks naturally</p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 min-h-0">
          <ChatContainer />
        </div>
      </div>
    </div>
  )
}
