"use client"

/**
 * MessageBubble Component
 *
 * Displays a single chat message with clean styling
 * Minimal animations - opacity fade only
 */

import { User, Bot, Copy, Check } from "lucide-react"
import { useState } from "react"
import type { ChatMessage } from "@/hooks/useChat"

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex gap-3 animate-in fade-in duration-150 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
            : "bg-gradient-to-br from-blue-500 to-teal-500"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[75%]`}>
        <div
          className={`relative group px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-sm shadow-neu"
              : "bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-white rounded-tl-sm neumorphic"
          }`}
        >
          {/* Message Text */}
          <div className="whitespace-pre-wrap break-words">
            {message.content || (
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span>Thinking</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                </span>
              </span>
            )}
          </div>

          {/* Copy Button (for assistant messages) */}
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
              aria-label={copied ? "Copied" : "Copy message"}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 px-2">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}
