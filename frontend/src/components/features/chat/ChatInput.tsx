"use client"

import { useState, useRef, useEffect, KeyboardEvent } from "react"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "Ask me to manage your tasks...",
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px"
    }
  }, [message])

  const handleSubmit = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim())
      setMessage("")
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = message.trim().length > 0 && !isLoading && !disabled

  return (
    <div className="relative">
      <div
        className="flex items-end gap-2.5 p-2.5 rounded-xl"
        style={{
          background: "#181B23",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-sm min-h-[24px] max-h-[150px] py-1 px-2"
          style={{
            color: "rgba(255,255,255,0.88)",
          }}
          // @ts-expect-error -- non-standard placeholderStyle prop
          placeholderStyle={{ color: "rgba(255,255,255,0.25)" }}
        />

        <button
          onClick={handleSubmit}
          disabled={!canSend}
          className="flex-shrink-0 p-2.5 rounded-lg transition-all duration-150 active:scale-95"
          style={
            canSend
              ? {
                  background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                  boxShadow: "0 0 12px rgba(99,102,241,0.28)",
                  color: "#fff",
                }
              : {
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.18)",
                  cursor: "not-allowed",
                }
          }
          aria-label="Send message"
        >
          {isLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-[10px] mt-1.5 text-center" style={{ color: "rgba(255,255,255,0.20)" }}>
        Press{" "}
        <kbd className="px-1 py-0.5 rounded font-mono text-[10px]" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.38)" }}>
          Enter
        </kbd>{" "}
        to send,{" "}
        <kbd className="px-1 py-0.5 rounded font-mono text-[10px]" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.38)" }}>
          Shift+Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  )
}
