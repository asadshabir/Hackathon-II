"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { TagChip } from "@/components/ui/tag-chip"
import { GlassCard } from "@/components/ui/glass-card"

/**
 * TagManagementPanel Component
 *
 * Panel for creating, listing, and deleting tags.
 * Features: name input, color picker, existing tags list with delete.
 */

export interface TagData {
  id: string
  name: string
  color: string
}

interface TagManagementPanelProps {
  tags: TagData[]
  onCreateTag: (name: string, color: string) => Promise<void>
  onDeleteTag: (tagId: string) => Promise<void>
  isLoading?: boolean
}

const DEFAULT_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
]

export function TagManagementPanel({
  tags,
  onCreateTag,
  onDeleteTag,
  isLoading = false,
}: TagManagementPanelProps) {
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#3B82F6")
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) return

    setCreating(true)
    try {
      await onCreateTag(newName.trim(), newColor)
      setNewName("")
    } catch {
      // Error handled by parent
    } finally {
      setCreating(false)
    }
  }

  return (
    <GlassCard className="p-5 space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        Manage Tags
      </h3>

      {/* Create tag form */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tag name..."
          maxLength={50}
          className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:border-indigo-500 focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
          title="Pick tag color"
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick color presets */}
      <div className="flex gap-1.5">
        {DEFAULT_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setNewColor(c)}
            className={`w-6 h-6 rounded-full transition-transform ${
              newColor === c ? "ring-2 ring-offset-1 ring-indigo-500 scale-110" : ""
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Tag list */}
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && !isLoading && (
          <p className="text-sm text-slate-400">No tags yet</p>
        )}
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            name={tag.name}
            color={tag.color}
            size="md"
            onDelete={() => onDeleteTag(tag.id)}
          />
        ))}
      </div>
    </GlassCard>
  )
}
