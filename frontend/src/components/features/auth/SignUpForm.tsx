"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Mail, Lock, Loader2 } from "lucide-react"
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
import { signUpSchema, type SignUpFormData } from "@/schemas/auth"
import { PasswordStrength } from "./PasswordStrength"

const inputBase =
  "flex h-11 w-full rounded-xl text-sm transition-colors duration-150 bg-[#181B23] border border-white/[0.08] text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"

export function SignUpForm() {
  const { signUp, isLoading } = useAuth()

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "", confirmPassword: "", name: "" },
  })

  const onSubmit = async (data: SignUpFormData) => {
    await signUp(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Full name <span className="text-white/20 normal-case">(optional)</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                  <input
                    placeholder="John Doe"
                    {...field}
                    disabled={isLoading}
                    className={`${inputBase} pl-10 pr-4 py-2`}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-rose-400 text-xs" />
            </FormItem>
          )}
        />

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
                    className={`${inputBase} pl-10 pr-4 py-2`}
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
              <FormLabel className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none z-10" />
                  <PasswordInput
                    placeholder="Min. 8 characters"
                    {...field}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <PasswordStrength password={field.value} />
              <FormMessage className="text-rose-400 text-xs" />
            </FormItem>
          )}
        />

        {/* Confirm Password */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Confirm password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none z-10" />
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{
            background: "linear-gradient(135deg, #4F46E5, #6366F1)",
            boxShadow: "0 0 0 1px rgba(99,102,241,0.4), 0 4px 20px rgba(99,102,241,0.30)",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-center text-[11px] text-white/20 leading-relaxed">
          By creating an account you agree to our{" "}
          <span className="text-indigo-400/70">Terms of Service</span> &{" "}
          <span className="text-indigo-400/70">Privacy Policy</span>
        </p>
      </form>
    </Form>
  )
}
