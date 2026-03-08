# Deployment Instructions for Todo AI Chatbot App

## Overview
This document outlines the deployment process for the Todo AI Chatbot App with neumorphic UI design.

## Architecture
- **Frontend**: Next.js application hosted on Vercel
- **Backend**: FastAPI application hosted on Hugging Face Spaces
- **Database**: Neon PostgreSQL
- **AI Service**: Google Gemini API with Hugging Face Inference fallback

## Deployment Steps

### 1. Frontend Deployment (Vercel)
1. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL=https://asadshabir110-todo-ai-chatbot-api.hf.space`
   - `NEXT_PUBLIC_APP_URL=https://advanced-todo-app-asadshabir.vercel.app`

2. Deploy using the CLI:
   ```bash
   cd frontend
   npx vercel --prod
   ```

### 2. Backend Deployment (Hugging Face Spaces)
1. The backend is already deployed on Hugging Face Spaces
2. Access URL: `https://asadshabir110-todo-ai-chatbot-api.hf.space`

### 3. Automated Deployment
Run the deployment script:
```bash
./deploy.sh
```

## Environment Variables

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_URL`: Frontend application URL

### Backend (Hugging Face Spaces)
- `DATABASE_URL`: Neon PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API key
- `HF_TOKEN`: Hugging Face API token (for fallback inference)

## URLs
- **Frontend**: https://advanced-todo-app-asadshabir.vercel.app
- **Backend API**: https://asadshabir110-todo-ai-chatbot-api.hf.space
- **API Documentation**: https://asadshabir110-todo-ai-chatbot-api.hf.space/docs

## Features
- ✅ Neumorphic UI design with depth and subtle shadows
- ✅ AI-powered chatbot for task management
- ✅ Real-time notifications and reminders
- ✅ Analytics dashboard with data visualization
- ✅ Full mobile responsiveness
- ✅ Secure authentication system
- ✅ Task management with priorities and due dates

## Troubleshooting
- If frontend can't connect to backend, verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings if experiencing connection issues
- Verify all environment variables are properly configured

## Version
- **App Version**: 5.0.0 (Neumorphic UI Release)
- **Frontend Framework**: Next.js 15.0.0
- **Backend Framework**: FastAPI with Python 3.12