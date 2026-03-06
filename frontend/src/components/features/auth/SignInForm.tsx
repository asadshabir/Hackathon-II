"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Mail, Lock, Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PasswordInput } from "@/components/ui/password-input"
import { useAuth } from "@/hooks/useAuth"
import { signInSchema, type SignInFormData } from "@/schemas/auth"

export function SignInForm() {
  const { signIn, isLoading } = useAuth()

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "", rememberMe: false },
  })

  const onSubmit = async (data: SignInFormData) => {
    await signIn(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Email address
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                    disabled={isLoading}
                    className="flex h-11 w-full rounded-xl pl-10 pr-4 py-2 text-sm transition-colors duration-150 bg-[#181B23] border border-white/[0.08] text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-rose-400 text-xs" />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-medium text-white/50 uppercase tracking-wider">
                  Password
                </FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                  <PasswordInput
                    placeholder="••••••••"
                    {...field}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-rose-400 text-xs" />
            </FormItem>
          )}
        />

        {/* Remember me */}
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2.5">
              <FormControl>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    id="remember-me"
                    className="sr-only"
                  />
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={field.value}
                    onClick={() => field.onChange(!field.value)}
                    disabled={isLoading}
                    className={`w-4.5 h-4.5 rounded-md border transition-all duration-150 flex items-center justify-center ${
                      field.value
                        ? "bg-indigo-600 border-indigo-500"
                        : "bg-[#181B23] border-white/15 hover:border-white/30"
                    }`}
                    style={{ width: "18px", height: "18px" }}
                  >
                    {field.value && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </FormControl>
              <FormLabel htmlFor="remember-me" className="!mt-0 text-sm text-white/45 cursor-pointer font-normal select-none">
                Keep me signed in
              </FormLabel>
            </FormItem>
          )}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #4F46E5, #6366F1)",
            boxShadow: "0 0 0 1px rgba(99,102,241,0.4), 0 4px 20px rgba(99,102,241,0.30)",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </Form>
  )
}
