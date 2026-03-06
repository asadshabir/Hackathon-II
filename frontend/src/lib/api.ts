/**
 * API Client for Todo AI Chatbot
 *
 * Comprehensive API client supporting:
 * - Authentication (JWT via localStorage)
 * - Todo CRUD operations with priority, due dates, recurrence
 * - Tags management
 * - Reminders management
 * - Analytics
 * - User preferences
 * - AI Chat functionality
 * - Conversations management
 */

import type { Todo, TodoFormData } from "@/types/todo"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ==================== Types ====================

export interface User {
  id: string
  email: string
  name?: string
  createdAt?: string
  created_at?: string
}

export interface AuthResponse {
  user: User
  access_token: string
  message?: string
}

export interface Task {
  id: string
  title: string
  completed: boolean
  created_at: string
  completed_at: string | null
  priority: string
  due_date: string | null
  recurrence_type: string
  recurrence_interval: number
}

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Reminder {
  id: string
  task_id: string
  reminder_time: string
  status: string
  created_at: string
}

export interface AnalyticsData {
  completion_today: number
  completion_week: number
  completion_month: number
  streak: { current: number; longest: number }
  priority_distribution: Record<string, number>
  tag_distribution: Record<string, number>
  overdue_count: number
  trends: Array<{ date: string; completions: number }>
  last_updated: string
}

export interface UserPreferences {
  id?: string
  user_id: string
  notification_channel: string
  timezone: string
  reminder_offset_minutes: number
  default_priority: string
  sort_order: string
  theme: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  created_at: string
  last_activity_at: string
}

export interface ChatResponse {
  response: string
  conversation_id: string
}

// ==================== API Client ====================

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  }

  /**
   * Get the auth token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getToken()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    let response: Response
    try {
      response = await fetch(url, {
        ...options,
        headers,
      })
    } catch (_networkError) {
      throw new Error(
        "Unable to connect to the server. Please check that the backend is running."
      )
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        data?.error || data?.detail || `Request failed with status ${response.status}`
      throw new Error(errorMessage)
    }

    return data
  }

  // ==================== AUTH ====================

  async signup(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async signout(): Promise<{ message: string }> {
    const result = await this.request<{ message: string }>("/api/auth/signout", {
      method: "POST",
    })
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
    }
    return result
  }

  async getMe(): Promise<User> {
    return this.request<User>("/api/auth/me")
  }

  // ==================== TODOS ====================

  /**
   * Map backend Task (snake_case) to frontend Todo (camelCase).
   * Also accepts partial/raw objects from WebSocket events.
   */
  mapTaskToTodo(task: Task): Todo {
    return {
      id: task.id,
      title: task.title,
      completed: task.completed ?? false,
      status: task.completed ? "completed" : "pending",
      priority: (task.priority as Todo["priority"]) || "medium",
      category: "personal",
      createdAt: task.created_at,
      updatedAt: task.completed_at || task.created_at,
      userId: "",
      dueDate: task.due_date || undefined,
      recurrenceType: task.recurrence_type,
      recurrenceInterval: task.recurrence_interval,
    }
  }

  async getTodos(
    filter: "all" | "pending" | "completed" = "all",
    sortBy?: string,
    q?: string,
    priority?: string,
  ): Promise<Todo[]> {
    const params = new URLSearchParams({ filter })
    if (sortBy) params.set("sort_by", sortBy)
    if (q) params.set("q", q)
    if (priority) params.set("priority", priority)

    const response = await this.request<{ tasks: Task[]; count: number }>(
      `/api/tasks?${params.toString()}`
    )
    return response.tasks.map((task) => this.mapTaskToTodo(task))
  }

  async createTodo(todoData: Partial<TodoFormData> & { title: string }): Promise<Todo> {
    const task = await this.request<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: todoData.title,
        priority: todoData.priority || "medium",
        due_date: todoData.dueDate || null,
        recurrence_type: todoData.recurrenceType || "none",
        recurrence_interval: todoData.recurrenceInterval || 1,
      }),
    })
    return {
      ...this.mapTaskToTodo(task),
      description: todoData.description,
      category: todoData.category || "personal",
      reminderTime: todoData.reminderTime,
      reminderEnabled: todoData.reminderEnabled,
    }
  }

  async updateTodo(
    id: string,
    updates: Partial<TodoFormData> & { completed?: boolean }
  ): Promise<Todo> {
    const body: Record<string, unknown> = {}
    if (updates.title !== undefined) body.title = updates.title
    if (updates.completed !== undefined) body.completed = updates.completed
    if (updates.priority !== undefined) body.priority = updates.priority
    if (updates.dueDate !== undefined) body.due_date = updates.dueDate || ""
    if (updates.recurrenceType !== undefined) body.recurrence_type = updates.recurrenceType
    if (updates.recurrenceInterval !== undefined) body.recurrence_interval = updates.recurrenceInterval

    const task = await this.request<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
    return {
      ...this.mapTaskToTodo(task),
      description: updates.description,
      category: updates.category || "personal",
      reminderTime: updates.reminderTime,
      reminderEnabled: updates.reminderEnabled,
    }
  }

  async toggleTodoCompletion(id: string, completed: boolean): Promise<Todo> {
    const task = await this.request<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    })
    return this.mapTaskToTodo(task)
  }

  async deleteTodo(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/tasks/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== TAGS ====================

  async getTags(): Promise<Tag[]> {
    const response = await this.request<{ tags: Tag[]; count: number }>("/api/tags")
    return response.tags
  }

  async createTag(name: string, color?: string): Promise<Tag> {
    return this.request<Tag>("/api/tags", {
      method: "POST",
      body: JSON.stringify({ name, color: color || "#6B7280" }),
    })
  }

  async deleteTag(tagId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/tags/${tagId}`, {
      method: "DELETE",
    })
  }

  // ==================== REMINDERS ====================

  async getReminders(): Promise<Reminder[]> {
    const response = await this.request<{ reminders: Reminder[]; count: number }>(
      "/api/reminders"
    )
    return response.reminders
  }

  async createReminder(taskId: string, reminderTime: string): Promise<Reminder> {
    return this.request<Reminder>("/api/reminders", {
      method: "POST",
      body: JSON.stringify({ task_id: taskId, reminder_time: reminderTime }),
    })
  }

  async cancelReminder(reminderId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/reminders/${reminderId}`, {
      method: "DELETE",
    })
  }

  // ==================== ANALYTICS ====================

  async getAnalytics(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>("/api/analytics/")
  }

  // ==================== PREFERENCES ====================

  async getPreferences(): Promise<UserPreferences> {
    return this.request<UserPreferences>("/api/preferences/")
  }

  async updatePreferences(
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    return this.request<UserPreferences>("/api/preferences/", {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  // ==================== CHAT ====================

  async sendMessage(
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    })
  }

  // ==================== CONVERSATIONS ====================

  async getConversations(limit: number = 20): Promise<Conversation[]> {
    const response = await this.request<{
      conversations: Conversation[]
      count: number
    }>(`/api/conversations?limit=${limit}`)
    return response.conversations
  }

  async getConversationMessages(
    conversationId: string,
    limit: number = 100
  ): Promise<Message[]> {
    const response = await this.request<{ messages: Message[]; count: number }>(
      `/api/conversations/${conversationId}/messages?limit=${limit}`
    )
    return response.messages
  }

  // ==================== HEALTH ====================

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>("/api/health")
  }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

// For backward compatibility
export const api = apiClient
