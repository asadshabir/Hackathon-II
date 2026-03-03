"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react"

/**
 * Footer Component
 *
 * Clean footer with social links
 * No heavy animations - CSS transitions only
 */

export function Footer() {
  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@taskflow.com", label: "Email" },
  ]

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Integrations", href: "#integrations" },
        { label: "Updates", href: "#updates" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Blog", href: "#blog" },
        { label: "Careers", href: "#careers" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#docs" },
        { label: "Help Center", href: "#help" },
        { label: "Community", href: "#community" },
        { label: "API", href: "#api" },
      ],
    },
  ]

  return (
    <footer className="relative border-t border-white/[0.05] bg-black">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold gradient-violet-cyan mb-3">TaskFlow</h3>
            <p className="text-white/35 text-sm mb-5 max-w-xs leading-relaxed">
              The future of task management — beautiful, AI-powered, built for AMOLED.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-white/40" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section, si) => (
            <div key={si}>
              <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link, li) => (
                  <li key={li}>
                    <Link href={link.href} className="text-sm text-white/40 hover:text-white/75 transition-colors duration-150">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-white/25 text-xs flex items-center gap-1.5">
            © 2026 TaskFlow. Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for productivity
          </p>
          <div className="flex gap-5 text-xs">
            <Link href="#privacy" className="text-white/25 hover:text-white/55 transition-colors">Privacy Policy</Link>
            <Link href="#terms" className="text-white/25 hover:text-white/55 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
