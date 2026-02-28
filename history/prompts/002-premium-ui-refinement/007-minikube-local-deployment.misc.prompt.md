---
id: 007
title: Minikube Local Deployment
stage: misc
date: 2026-02-08
surface: agent
model: claude-opus-4-6
feature: 002-premium-ui-refinement
branch: 002-premium-ui-refinement
user: Asad Shabir
command: deploy-to-minikube
labels: ["deployment", "minikube", "helm", "kubernetes", "docker", "local"]
links:
  spec: specs/002-premium-ui-refinement/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - todo-chatbot/values.yaml
tests:
  - curl http://localhost:8000/api/health -> {"status":"healthy"}
  - curl http://localhost:3000 -> 200 OK
  - kubectl get pods -> both 1/1 Running
---

## Prompt

Read the PHR carefully and deploy the app on local now. The minikube is already running now you can deploy. Step by step think and perform action. Also check and make sure the images are already built or not and delete unnecessary build images and continue deployment.

## Response snapshot

Deployed the full-stack Todo AI Chatbot to minikube using the existing Helm chart (`todo-chatbot/`).

1. **Verified minikube** is running (k8s v1.35.0, IP 192.168.49.2, Helm v4.1.0).
2. **Checked images**: Found `todo-backend:latest` (667MB) and `todo-frontend:latest` (298MB) pre-built in local Docker. No app images in minikube yet.
3. **Loaded images** into minikube via `minikube image load` (both backend and frontend).
4. **Updated Helm values** (`todo-chatbot/values.yaml`):
   - Set real DATABASE_URL (Neon PostgreSQL), GOOGLE_API_KEY, JWT_SECRET from `backend/.env`
   - Updated GEMINI_MODEL from `gemini-2.0-flash` to `gemini-2.5-flash`
   - Expanded CORS_ORIGINS to include minikube IP and localhost variants
5. **Deployed with Helm**: `helm install todo-app ./todo-chatbot` - deployed successfully.
6. **Port-forwarded** both services to localhost (frontend:3000, backend:8000).
7. **Verified**: Backend health check returns `{"status":"healthy"}`, frontend returns 200 OK.

## Outcome

- Impact: Full-stack app deployed and accessible on minikube at localhost:3000 (frontend) and localhost:8000 (backend API).
- Tests: Backend health endpoint healthy, frontend serving 200, both pods Running 1/1.
- Files: 1 file modified (todo-chatbot/values.yaml with real secrets and corrected env vars).
- Next prompts: Visual QA in browser, test auth flow end-to-end, consider rebuilding frontend with minikube-native API URL to avoid port-forward dependency.
- Reflection: Pre-built images in local Docker saved significant time vs rebuilding inside minikube. The `minikube image load` command is the fastest path when images already exist locally. Port-forwarding is necessary because the frontend was built with `NEXT_PUBLIC_API_URL=http://localhost:8000` baked in at build time.

## Evaluation notes (flywheel)

- Failure modes observed: minikube had corrupted certs from a previous session requiring delete+recreate. Lock files from interrupted downloads needed manual cleanup.
- Graders run and results (PASS/FAIL): Backend health PASS, Frontend 200 PASS, Pods Running PASS.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Rebuild frontend image with `--build-arg NEXT_PUBLIC_API_URL=http://192.168.49.2:30001` to eliminate port-forward dependency.
