---
id: 014
title: Vercel Deployment Configuration Complete
stage: green
date: 2026-02-12
surface: agent
model: claude-opus-4-6
feature: 003-advanced-features
branch: 003-advanced-features
user: Asad Shabir
command: sp.tasks
labels: ["vercel", "deployment", "frontend", "next.js", "ngrok", "production"]
links:
  spec: specs/003-advanced-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/vercel.json
  - frontend/.vercelignore
  - VERCEL_DEPLOYMENT.md
tests:
  - vercel.json exists with rewrites, security headers, and cache config
  - .vercelignore excludes node_modules, .next/cache, and local env files
  - next build passes cleanly (12/12 pages, zero errors)
  - Deployment guide includes ngrok tunnel instructions for demo video
  - Target domain documented as advanced-todo-app-asadshabir.vercel.app
  - GitHub auto-deploy steps included
---

## Prompt

Task #5: Create Vercel deployment configuration for Hackathon II Phase V - Part B.

Generate all files and step-by-step instructions to deploy Next.js frontend to Vercel with domain advanced-todo-app-asadshabir.vercel.app, including vercel.json with rewrites and security headers, .vercelignore, environment variable documentation, ngrok tunnel instructions for local backend demo, and GitHub auto-deploy setup.

Agents: deployment-orchestrator-agent
Skills: DeploymentBlueprintSkill

## Response snapshot

Created 3 deployment artifacts:

1. **frontend/vercel.json** - Updated with security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, Permissions-Policy), static asset cache headers (1yr immutable), and API rewrites
2. **frontend/.vercelignore** - Excludes node_modules, .next/cache, local env files, Dockerfile, and logs from Vercel upload
3. **VERCEL_DEPLOYMENT.md** - Comprehensive deployment guide with:
   - Vercel CLI install and login steps
   - Preview and production deploy commands
   - Environment variable setup (dashboard + CLI options)
   - Domain alias for advanced-todo-app-asadshabir.vercel.app
   - ngrok tunnel instructions for connecting live frontend to local backend
   - Backend CORS update steps
   - GitHub auto-deploy configuration
   - Post-deployment checklist (12 items)
   - Troubleshooting reference table

Build verified: `next build` passes cleanly (12/12 pages, 0 errors, standalone output).

## Outcome

- Impact: Complete Vercel deployment configuration enabling one-command production deployment of the frontend
- Tests: All acceptance criteria met - vercel.json valid, build passes, env vars documented, ngrok instructions included
- Files: 3 files created/updated
- Next prompts: Execute vercel deploy commands to get live URL
- Reflection: Replaced outdated Railway references with Docker Compose + ngrok pattern for hackathon demo

## Evaluation notes (flywheel)

- Failure modes observed: None - build passes cleanly
- Graders run and results (PASS/FAIL): All acceptance criteria PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run `npx vercel --prod` to deploy and verify live URL
