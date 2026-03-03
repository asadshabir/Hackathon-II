"use client"

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
            ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)" }
            : { background: "#181B23", border: "1px solid rgba(255,255,255,0.08)" }
        }
      >
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4" style={{ color: "#818CF8" }} />}
      </div>

      {/* Content */}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
        <div
          className="relative group px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={
            isUser
              ? {
                  background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                  color: "#fff",
                  borderBottomRightRadius: "4px",
                }
              : {
                  background: "#181B23",
                  color: "rgba(255,255,255,0.82)",
                  borderBottomLeftRadius: "4px",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
                }
          }
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content || (
              <span className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                <span>Thinking</span>
                <span className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: "#818CF8", animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
              </span>
            )}
          </div>

          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg"
              style={{
                background: "#1F2330",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
              aria-label={copied ? "Copied" : "Copy message"}
            >
              {copied
                ? <Check className="w-3 h-3 text-emerald-400" />
                : <Copy className="w-3 h-3" style={{ color: "rgba(255,255,255,0.38)" }} />}
            </button>
          )}
        </div>

        <span className="text-[10px] mt-1 px-1" style={{ color: "rgba(255,255,255,0.20)" }}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  )
}
