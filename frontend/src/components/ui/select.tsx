"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

function useSelectContext() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("Select components must be used within a Select")
  return ctx
}

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

function Select({ value: controlledValue, defaultValue = "", onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)

  const value = controlledValue ?? internalValue
  const handleChange = React.useCallback(
    (newValue: string) => {
      setInternalValue(newValue)
      onValueChange?.(newValue)
      setOpen(false)
    },
    [onValueChange],
  )

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelectContext()

  return (
    <button
      ref={ref}
      type="button"
      role="combobox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm",
        "ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-slate-700 dark:bg-slate-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-400",
        className,
      )}
      {...props}
    >
      {children}
      <svg
        className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useSelectContext()

  // Find the label for the current value by looking through sibling SelectItems
  // For simplicity, display the value directly (will be overridden by SelectItem rendering)
  return <span className="truncate">{value || placeholder || "Select..."}</span>
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = useSelectContext()
  const ref = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // Check if the click is on the trigger button
        const parent = ref.current.closest(".relative")
        if (parent && parent.contains(e.target as Node)) return
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg",
        "dark:border-slate-700 dark:bg-slate-900",
        "animate-in fade-in-0 zoom-in-95",
        className,
      )}
    >
      {children}
    </div>
  )
}

function SelectItem({
  value: itemValue,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value, onValueChange } = useSelectContext()
  const isSelected = value === itemValue

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => onValueChange(itemValue)}
      className={cn(
        "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        isSelected && "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
        className,
      )}
    >
      {isSelected && (
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span className={isSelected ? "" : "pl-6"}>{children}</span>
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
