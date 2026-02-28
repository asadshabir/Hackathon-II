# Todo AI Chatbot Deployment Guide

## Backend (Hugging Face Space)
Deployed at: https://asadshabir110-todo-ai-chatbot-api.hf.space

### Environment Variables (Set in Space Settings):
- `DATABASE_URL`: `postgresql+asyncpg://neondb_owner:npg_5BfglOWzc1wt@ep-snowy-sun-ahj05f5f.c-3.us-east-1.aws.neon.tech/neondb`
- `GOOGLE_API_KEY`: `AIzaSyDyq8F676FZSaGaixS43an1pnbrTU2W9CI`
- `GEMINI_MODEL`: `gemini-2.5-flash`
- `JWT_SECRET`: `-UtKBbFeK-lQ7f6XpKJAh_3A23uTYiOqBtlVx6hq9Qs`
- `CORS_ORIGINS`: `https://full-stack-todoapp-asadshabir.vercel.app,http://localhost:3000`

## Frontend (Vercel)
To be deployed at: https://full-stack-todoapp-asadshabir.vercel.app

### Environment Variables (Set in Vercel Project Settings):
- `NEXT_PUBLIC_API_URL`: `https://asadshabir110-todo-ai-chatbot-api.hf.space`

## API Endpoints Available:
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/me` - Get current user
- `POST /api/chat` - Chat with AI assistant
- `GET/POST /api/tasks` - Manage tasks
- `GET /api/conversations` - Get conversation history
- `GET /api/health` - Health check

## Features:
- AI-powered task management via natural language
- JWT authentication with refresh tokens
- Real-time chat interface with conversation history
- Premium UI with glassmorphism effects
- Task CRUD operations
- Dark/light mode support

## Troubleshooting:
- If API calls fail, check CORS settings in both backend and frontend
- Verify database connection in backend logs
- Check that Google API key has sufficient quota
- Ensure JWT tokens are properly handled in frontend
