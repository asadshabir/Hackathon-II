"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/contexts/ThemeContext"
import { apiClient, type UserPreferences } from "@/lib/api"

export default function SettingsPage() {
  const { session } = useAuth()
  const { toast } = useToast()
  const { setTheme: applyTheme } = useTheme()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load preferences from API
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await apiClient.getPreferences()
        setPreferences(data)
      } catch (error) {
        console.error("Failed to load preferences:", error)
        toast({
          title: "Error",
          description: "Failed to load preferences",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      loadPreferences()
    }
  }, [session, toast])

  const handlePreferenceChange = async (field: keyof UserPreferences, value: unknown) => {
    if (!preferences) return

    // Optimistic update
    const oldPreferences = { ...preferences }
    const newPreferences = { ...preferences, [field]: value }
    setPreferences(newPreferences)

    // Apply theme change immediately via ThemeContext
    if (field === "theme" && (value === "light" || value === "dark")) {
      applyTheme(value)
    }

    setSaving(true)
    try {
      await apiClient.updatePreferences({ [field]: value } as Record<string, unknown>)

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully",
      })
    } catch (error) {
      console.error("Failed to update preferences:", error)
      // Revert on error
      setPreferences(oldPreferences)
      if (field === "theme") {
        applyTheme(oldPreferences.theme as "light" | "dark")
      }
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: "#8B5CF6", borderRightColor: "rgba(139,92,246,0.3)", boxShadow: "0 0 16px rgba(139,92,246,0.4)" }} />
          <p className="text-white/40 text-sm">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-white/40 text-sm">Unable to load settings</p>
      </div>
    )
  }

  const rowClass = "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]"
  const labelClass = "text-sm font-semibold text-white/80"
  const descClass = "text-xs text-white/35 mt-0.5"
  const sectionClass = "rounded-2xl p-5 space-y-4"
  const sectionStyle = { background: "#0F0F0F", boxShadow: "0 0 0 1px rgba(255,255,255,0.05)" }

  return (
    <div className="min-h-screen pt-5 pb-2 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="px-1">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-0.5">Preferences</p>
          <h1 className="text-xl font-bold text-white">
            <span className="gradient-pink-violet">Settings</span>
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Customise your experience</p>
        </div>

        {/* Notifications */}
        <div className={sectionClass} style={sectionStyle}>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Notifications</p>
          <div className={rowClass}>
            <div>
              <Label className={labelClass}>Channel</Label>
              <p className={descClass}>Where you receive notifications</p>
            </div>
            <Select value={preferences.notification_channel} onValueChange={(v) => handlePreferenceChange("notification_channel", v)}>
              <SelectTrigger className="w-[160px] rounded-xl bg-white/[0.05] border-white/[0.08] text-white/70 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-app">In-App Only</SelectItem>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={rowClass}>
            <div>
              <Label className={labelClass}>Reminder Offset</Label>
              <p className={descClass}>Time before due date to remind</p>
            </div>
            <Select value={preferences.reminder_offset_minutes.toString()} onValueChange={(v) => handlePreferenceChange("reminder_offset_minutes", parseInt(v))}>
              <SelectTrigger className="w-[160px] rounded-xl bg-white/[0.05] border-white/[0.08] text-white/70 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task Defaults */}
        <div className={sectionClass} style={sectionStyle}>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Task Defaults</p>
          <div className={rowClass}>
            <div>
              <Label className={labelClass}>Default Priority</Label>
              <p className={descClass}>Priority for new tasks</p>
            </div>
            <Select value={preferences.default_priority} onValueChange={(v) => handlePreferenceChange("default_priority", v)}>
              <SelectTrigger className="w-[160px] rounded-xl bg-white/[0.05] border-white/[0.08] text-white/70 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={rowClass}>
            <div>
              <Label className={labelClass}>Sort Order</Label>
              <p className={descClass}>Default task sort</p>
            </div>
            <Select value={preferences.sort_order} onValueChange={(v) => handlePreferenceChange("sort_order", v)}>
              <SelectTrigger className="w-[160px] rounded-xl bg-white/[0.05] border-white/[0.08] text-white/70 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
                <SelectItem value="priority">By Priority</SelectItem>
                <SelectItem value="due_date">By Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Display */}
        <div className={sectionClass} style={sectionStyle}>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Display</p>
          <div className={rowClass}>
            <div>
              <Label className={labelClass}>Timezone</Label>
              <p className={descClass}>Used for due dates and reminders</p>
            </div>
            <Select value={preferences.timezone} onValueChange={(v) => handlePreferenceChange("timezone", v)}>
              <SelectTrigger className="w-[160px] rounded-xl bg-white/[0.05] border-white/[0.08] text-white/70 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Asia/Karachi">Karachi (PKT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={rowClass}>
            <div>
              <Label className={labelClass}>Theme</Label>
              <p className={descClass}>App visual appearance</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${preferences.theme === "light" ? "text-white/70 font-semibold" : "text-white/30"}`}>Light</span>
              <Switch checked={preferences.theme === "dark"} onCheckedChange={(c) => handlePreferenceChange("theme", c ? "dark" : "light")} />
              <span className={`text-xs ${preferences.theme === "dark" ? "text-violet-400 font-semibold" : "text-white/30"}`}>Dark</span>
            </div>
          </div>
        </div>

        {saving && (
          <div className="flex justify-center">
            <div className="px-4 py-2 rounded-xl text-xs font-medium text-violet-300 bg-violet-500/15 border border-violet-500/20">
              Saving changes...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}