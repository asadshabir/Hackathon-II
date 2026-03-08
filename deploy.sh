#!/bin/bash

# Deployment script for Todo AI Chatbot App

echo "🚀 Starting deployment of Todo AI Chatbot App..."

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the application..."
npm run build

echo "🌐 Deploying to Vercel..."
npx vercel --prod --token=$VERCEL_TOKEN

echo "✅ Deployment completed successfully!"

echo "🔗 Live application: https://advanced-todo-app-asadshabir.vercel.app"
echo "📊 API endpoint: https://asadshabir110-todo-ai-chatbot-api.hf.space"
echo "🏷️  Version: 5.0.0 (Neumorphic UI Release)"