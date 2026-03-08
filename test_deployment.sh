#!/bin/bash
# Test script to verify the full application functionality

echo "=== Testing Full Application Stack ==="
echo

echo "1. Testing Backend Health..."
BACKEND_HEALTH=$(curl -s https://asadshabir110-todo-ai-chatbot-api.hf.space/api/health | jq -r '.status')
if [ "$BACKEND_HEALTH" = "healthy" ]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi
echo

echo "2. Testing Frontend Accessibility..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://advanced-todo-app-asadshabir.vercel.app/)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is accessible (HTTP $FRONTEND_STATUS)"
else
    echo "❌ Frontend not accessible (HTTP $FRONTEND_STATUS)"
    exit 1
fi
echo

echo "3. Testing API Endpoints..."
API_DOCS=$(curl -s -o /dev/null -w "%{http_code}" https://asadshabir110-todo-ai-chatbot-api.hf.space/docs)
if [ "$API_DOCS" = "200" ]; then
    echo "✅ API documentation is accessible (HTTP $API_DOCS)"
else
    echo "❌ API documentation not accessible (HTTP $API_DOCS)"
    exit 1
fi
echo

echo "4. Testing API Root Endpoint..."
ROOT_RESPONSE=$(curl -s https://asadshabir110-todo-ai-chatbot-api.hf.space/)
if [[ $ROOT_RESPONSE == *"Todo AI Chatbot API"* ]]; then
    echo "✅ API root endpoint is working"
else
    echo "❌ API root endpoint not working properly"
    exit 1
fi
echo

echo "5. Testing API Tasks Endpoint (should return 401 without auth)..."
TASKS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://asadshabir110-todo-ai-chatbot-api.hf.space/api/tasks)
if [ "$TASKS_STATUS" = "401" ]; then
    echo "✅ API tasks endpoint correctly requires authentication (HTTP $TASKS_STATUS)"
else
    echo "⚠️  API tasks endpoint returned HTTP $TASKS_STATUS (expected 401)"
fi
echo

echo "=== Application Verification Complete ==="
echo "✅ All basic connectivity tests passed!"
echo
echo "Frontend: https://advanced-todo-app-asadshabir.vercel.app/"
echo "Backend: https://asadshabir110-todo-ai-chatbot-api.hf.space/"
echo "API Docs: https://asadshabir110-todo-ai-chatbot-api.hf.space/docs"