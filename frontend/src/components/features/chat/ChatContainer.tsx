"use client"

/**
 * ChatContainer Component
 *
 * Main chat interface combining messages, input, and conversation management
 */

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquarePlus, History, Bot, Sparkles, MessageCircle } from "lucide-react"
import { MessageBubble } from "./MessageBubble"
import { ChatInput } from "./ChatInput"
import { useChat } from "@/hooks/useChat"
import type { Conversation } from "@/lib/api"

interface ChatContainerProps {
  initialConversationId?: string
}

export function ChatContainer({ initialConversationId }: ChatContainerProps) {
  const {
    messages,
    isLoading,
    conversationId,
    conversations,
    sendMessage,
    loadConversation,
    startNewConversation,
  } = useChat({ conversationId: initialConversationId })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex h-full gap-3">
      {/* Conversations Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex flex-col w-64"
      >
        <div
          className="flex-1 flex flex-col p-3 rounded-2xl overflow-hidden"
          style={{ background: "#0F0F0F", boxShadow: "0 0 0 1px rgba(255,255,255,0.05)" }}
        >
          {/* New Chat Button */}
          <button
            onClick={startNewConversation}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-white font-semibold text-sm mb-3 transition-all duration-150 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
              boxShadow: "0 0 16px rgba(139,92,246,0.35)",
            }}
          >
            <MessageSquarePlus className="w-4 h-4" />
            New Conversation
          </button>

          {/* Section Label */}
          <div className="flex items-center gap-2 mb-2.5 px-1">
            <History className="w-3.5 h-3.5 text-white/30" />
            <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">Recent</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            <AnimatePresence>
              {conversations.map((conv, index) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === conversationId}
                  onClick={() => loadConversation(conv.id)}
                  index={index}
                />
              ))}
            </AnimatePresence>

            {conversations.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-7 h-7 mx-auto mb-2 text-white/15" />
                <p className="text-xs text-white/25">No conversations yet</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <div
          className="flex-1 flex flex-col overflow-hidden rounded-2xl"
          style={{ background: "#0F0F0F", boxShadow: "0 0 0 1px rgba(255,255,255,0.05)" }}
        >
          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ background: "#080808" }}
          >
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="flex flex-col space-y-3">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div
            className="p-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0A0A0A" }}
          >
            <ChatInput onSend={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Conversation Item Component
 */
function ConversationItem({
  conversation,
  isActive,
  onClick,
  index,
}: {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
  index: number
}) {
  const date = new Date(conversation.last_activity_at)
  const timeString = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 active:scale-95"
      style={
        isActive
          ? {
              background: "rgba(139,92,246,0.15)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.3)",
            }
          : {
              background: "transparent",
              boxShadow: "0 0 0 1px transparent",
            }
      }
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={
            isActive
              ? { background: "linear-gradient(135deg,#7C3AED,#8B5CF6)" }
              : { background: "rgba(255,255,255,0.06)" }
          }
        >
          <MessageCircle className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-white/35"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-white/60"}`}>
            Conversation
          </p>
          <p className="text-xs text-white/25">{timeString}</p>
        </div>
      </div>
    </motion.button>
  )
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center max-w-sm px-4">
        {/* Bot Icon */}
        <div
          className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: "linear-gradient(135deg,#7C3AED,#06B6D4)",
            boxShadow: "0 0 32px rgba(139,92,246,0.4)",
          }}
        >
          <Bot className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">AI Task Assistant</h3>
        <p className="text-sm text-white/40 mb-5 leading-relaxed">
          Manage your tasks using natural language. Try:
        </p>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Add a task to buy groceries",
            "Show my pending tasks",
            "Mark shopping task as done",
            "Delete completed tasks",
          ].map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.08 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/55"
              style={{
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <Sparkles className="w-3 h-3 text-violet-400" />
              {suggestion}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
