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
          <p className="text-[10px] font-bold text-white/28 uppercase tracking-widest mb-0.5">AI Assistant</p>
          <h1 className="text-xl font-black text-white leading-tight">
            <span style={{
              background: "linear-gradient(135deg, #A78BFA 0%, #38BDF8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>AI Task Assistant</span>
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
