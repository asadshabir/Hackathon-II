"use client"

import { useState, useEffect } from "react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlassCard } from "@/components/ui/glass-card"
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
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Unable to load settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Customize your experience</p>
        </div>

        {/* Notifications Section */}
        <GlassCard className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-slate-800/80">
              <div>
                <Label className="text-lg font-semibold text-slate-800 dark:text-slate-200">Channel</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Where you want to receive notifications</p>
              </div>
              <Select
                value={preferences.notification_channel}
                onValueChange={(value) => handlePreferenceChange("notification_channel", value)}
              >
                <SelectTrigger className="w-[180px] mt-2 sm:mt-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-app">In-App Only</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-slate-800/80">
              <div>
                <Label className="text-lg font-semibold text-slate-800 dark:text-slate-200">Default Reminder Offset</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Time before due date to show reminder</p>
              </div>
              <Select
                value={preferences.reminder_offset_minutes.toString()}
                onValueChange={(value) => handlePreferenceChange("reminder_offset_minutes", parseInt(value))}
              >
                <SelectTrigger className="w-[180px] mt-2 sm:mt-0">
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
          </CardContent>
        </GlassCard>

        {/* Task Defaults Section */}
        <GlassCard className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Task Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-slate-800/80">
              <div>
                <Label className="text-lg font-semibold text-slate-800 dark:text-slate-200">Default Priority</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Priority level for new tasks</p>
              </div>
              <Select
                value={preferences.default_priority}
                onValueChange={(value) => handlePreferenceChange("default_priority", value)}
              >
                <SelectTrigger className="w-[180px] mt-2 sm:mt-0">
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-slate-800/80">
              <div>
                <Label className="text-lg font-semibold text-slate-800 dark:text-slate-200">Default Sort Order</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Default way to sort tasks</p>
              </div>
              <Select
                value={preferences.sort_order}
                onValueChange={(value) => handlePreferenceChange("sort_order", value)}
              >
                <SelectTrigger className="w-[180px] mt-2 sm:mt-0">
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
          </CardContent>
        </GlassCard>

        {/* Display Section */}
        <GlassCard className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-slate-800/80">
              <div>
                <Label className="text-lg font-semibold text-slate-800 dark:text-slate-200">Timezone</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Used for due dates and reminders</p>
              </div>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => handlePreferenceChange("timezone", value)}
              >
                <SelectTrigger className="w-[180px] mt-2 sm:mt-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-slate-800/80">
              <div>
                <Label className="text-lg font-semibold text-slate-800 dark:text-slate-200">Theme</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Visual appearance of the app</p>
              </div>
              <div className="flex items-center gap-4 mt-2 sm:mt-0">
                <span className={`text-sm ${preferences.theme === "light" ? "text-slate-900 dark:text-white font-medium" : "text-slate-500"}`}>Light</span>
                <Switch
                  checked={preferences.theme === "dark"}
                  onCheckedChange={(checked) => handlePreferenceChange("theme", checked ? "dark" : "light")}
                />
                <span className={`text-sm ${preferences.theme === "dark" ? "text-slate-900 dark:text-white font-medium" : "text-slate-500"}`}>Dark</span>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Save Status */}
        {saving && (
          <div className="flex justify-center">
            <div className="px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
              Saving changes...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}