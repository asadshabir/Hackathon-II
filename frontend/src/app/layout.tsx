import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import { PWAInstallButton } from "@/components/ui/PWAInstallButton"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TaskFlow AI - Advanced Todo Application",
  description: "AI-powered task management with stunning 3D animations and real-time sync",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/android-chrome-192x192.png" />
        <meta name="theme-color" content="#111318" />
      </head>
      <body className={`${inter.className} dark:bg-[#0A0B0F] dark:text-white`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
          <PWAInstallButton />
        </Providers>
      </body>
    </html>
  )
}
