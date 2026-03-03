"use client"

/**
 * MessageBubble Component
 *
 * Displays a single chat message with AMOLED styling
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
    <div className={`flex gap-2.5 animate-in fade-in duration-150 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
        style={
          isUser
            ? { background: "linear-gradient(135deg,#7C3AED,#8B5CF6)", boxShadow: "0 0 12px rgba(139,92,246,0.35)" }
            : { background: "linear-gradient(135deg,#06B6D4,#8B5CF6)", boxShadow: "0 0 12px rgba(6,182,212,0.3)" }
        }
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
        <div
          className="relative group px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={
            isUser
              ? {
                  background: "linear-gradient(135deg,#7C3AED,#8B5CF6)",
                  color: "#fff",
                  borderBottomRightRadius: "4px",
                  boxShadow: "0 0 16px rgba(139,92,246,0.25)",
                }
              : {
                  background: "#1A1A1A",
                  color: "rgba(255,255,255,0.82)",
                  borderBottomLeftRadius: "4px",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
                }
          }
        >
          {/* Message Text */}
          <div className="whitespace-pre-wrap break-words">
            {message.content || (
              <span className="flex items-center gap-2 text-white/40">
                <span>Thinking</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                </span>
              </span>
            )}
          </div>

          {/* Copy Button (for assistant messages) */}
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg"
              style={{
                background: "#2A2A2A",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              aria-label={copied ? "Copied" : "Copy message"}
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-white/40" />
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-white/20 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}
