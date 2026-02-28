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
import { GlassCard } from "@/components/ui/glass-card"
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex h-full gap-4">
      {/* Conversations Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex flex-col w-72"
      >
        <GlassCard className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* New Chat Button */}
          <button
            onClick={startNewConversation}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow-md transition-all duration-150 mb-4"
          >
            <MessageSquarePlus className="w-5 h-5" />
            New Conversation
          </button>

          {/* Conversations List */}
          <div className="flex items-center gap-2 mb-3 px-2">
            <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
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
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                <p className="text-sm text-slate-400 dark:text-slate-500">No conversations yet</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <GlassCard className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-900 dark:to-slate-800"
          >
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="flex flex-col space-y-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <ChatInput onSend={sendMessage} isLoading={isLoading} />
          </div>
        </GlassCard>
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
      className={`w-full text-left px-4 py-3 rounded-xl transition-colors duration-150 ${
        isActive
          ? "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800"
          : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActive
              ? "bg-indigo-600"
              : "bg-slate-100 dark:bg-slate-800"
          }`}
        >
          <MessageCircle className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            Conversation
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{timeString}</p>
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
      <div className="text-center max-w-md">
        {/* Bot Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
          <Bot className="w-10 h-10 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          AI Task Assistant
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          I can help you manage your tasks using natural language. Try saying
          things like:
        </p>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "Add a task to buy groceries",
            "Show my pending tasks",
            "Mark shopping task as done",
            "Delete the completed tasks",
          ].map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              {suggestion}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
