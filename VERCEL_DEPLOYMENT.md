# Vercel Deployment Guide -- Phase V

**Target domain:** `advanced-todo-app-asadshabir.vercel.app`
**Agents:** deployment-orchestrator-agent | **Skills:** DeploymentBlueprintSkill

---

## Prerequisites

- Node.js 20+ installed
- Vercel account (free tier, no credit card needed)
- GitHub repository with code pushed
- Backend running locally via Docker Compose at `http://localhost:8000`

---

## Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

---

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the browser prompt to authenticate.

---

## Step 3: Deploy Preview

From the `frontend/` directory:

```bash
cd frontend
vercel
```

When prompted:
- **Set up and deploy?** `Y`
- **Which scope?** Select your personal account
- **Link to existing project?** `N` (first time)
- **What's your project's name?** `advanced-todo-app-asadshabir`
- **In which directory is your code located?** `./`
- **Want to modify settings?** `N`

You'll get a preview URL like:
```
https://advanced-todo-app-asadshabir-xxxxx.vercel.app
```

---

## Step 4: Set Environment Variables

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click on project **advanced-todo-app-asadshabir**
3. Go to **Settings** > **Environment Variables**
4. Add:

| Variable | Value | Environments |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://advanced-todo-app-asadshabir.vercel.app` | Production |
| `NEXT_PUBLIC_WEBSOCKET_URL` | `wss://your-backend-url.com` | Production |

### Option B: Via CLI

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend-url.com

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://advanced-todo-app-asadshabir.vercel.app
```

---

## Step 5: Deploy to Production

```bash
vercel --prod
```

Live at: **https://advanced-todo-app-asadshabir.vercel.app**

---

## Step 6: Set Domain Alias

```bash
vercel alias set advanced-todo-app-asadshabir-xxxxx.vercel.app advanced-todo-app-asadshabir.vercel.app
```

Or via dashboard: **Settings** > **Domains** > Add `advanced-todo-app-asadshabir.vercel.app`

---

## Connecting Live Frontend to Local Backend (Demo Video)

For hackathon demo, expose your local backend via **ngrok**:

### 1. Install ngrok

```bash
# Windows (winget)
winget install ngrok

# Or download from https://ngrok.com/download
```

### 2. Start ngrok tunnel

```bash
ngrok http 8000
```

Copy the public URL (e.g. `https://abc123.ngrok-free.app`)

### 3. Update Vercel env vars

Go to Vercel Dashboard > Settings > Environment Variables:

| Variable | New Value |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://abc123.ngrok-free.app` |
| `NEXT_PUBLIC_WEBSOCKET_URL` | `wss://abc123.ngrok-free.app` |

### 4. Redeploy

```bash
cd frontend && vercel --prod
```

### 5. Update backend CORS

Add the Vercel domain to your backend's CORS origins. In `docker-compose.yml`, update backend environment:

```yaml
environment:
  - CORS_ORIGINS=http://localhost:3000,https://advanced-todo-app-asadshabir.vercel.app,https://abc123.ngrok-free.app
```

Then restart:
```bash
docker compose restart backend
```

### 6. Verify

Open `https://advanced-todo-app-asadshabir.vercel.app` -> Sign up -> Create tasks -> Full flow works.

---

## GitHub Auto-Deploy

### 1. Push code to GitHub

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin 003-advanced-features
```

### 2. Connect to Vercel via GitHub

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your repo
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework:** Next.js (auto-detected)
5. Add environment variables (same as Step 4)
6. Click **Deploy**

Now every push to `main` auto-deploys to production.

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `https://your-backend.com` |
| `NEXT_PUBLIC_APP_URL` | No | Frontend URL (auth redirects) | `https://advanced-todo-app-asadshabir.vercel.app` |
| `NEXT_PUBLIC_WEBSOCKET_URL` | No | WebSocket URL (derived from API URL if not set) | `wss://your-backend.com` |

---

## Post-Deployment Checklist

- [ ] Landing page loads at `advanced-todo-app-asadshabir.vercel.app`
- [ ] Sign up creates new user
- [ ] Sign in authenticates and redirects to dashboard
- [ ] Dashboard shows todos
- [ ] Can create, edit, toggle, delete todos
- [ ] AI Chat works (send message, get response)
- [ ] Analytics page loads
- [ ] Settings page loads
- [ ] Calendar page loads
- [ ] Sign out clears auth
- [ ] No console errors in browser
- [ ] Mobile responsive

---

## Quick Commands

```bash
# Preview deploy
cd frontend && vercel

# Production deploy
cd frontend && vercel --prod

# Check status
vercel ls

# View logs
vercel logs advanced-todo-app-asadshabir.vercel.app

# Pull env vars locally
vercel env pull .env.local
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm run build` locally first |
| API calls fail | Check `NEXT_PUBLIC_API_URL` in Vercel dashboard |
| CORS errors | Add Vercel domain to backend `CORS_ORIGINS` |
| WebSocket disconnects | Set `NEXT_PUBLIC_WEBSOCKET_URL` with `wss://` |
| Auth not working | Ensure backend allows cookies from Vercel domain |
| Env vars not updating | Must redeploy after changing env vars |
