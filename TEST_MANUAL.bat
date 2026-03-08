@echo off
echo Manual Testing Instructions for Todo AI Chatbot:

echo.
echo ##########################################################
echo #                                                        #
echo #           MANUAL TESTING INSTRUCTIONS                  #
echo #                                                        #
echo ##########################################################
echo.
echo BACKEND TESTING:
echo 1. Navigate to backend directory and activate virtual environment:
echo    cd backend
echo    venv\Scripts\activate
echo    pip install -r requirements.txt
echo.
echo 2. Set environment variables:
echo    set DATABASE_URL=sqlite:///./todo_app.db
echo    set GOOGLE_API_KEY=your_key_here
echo    set SECRET_KEY=your_secret_key
echo.
echo 3. Initialize the database:
echo    python -c "from src.init_db import init_database; import asyncio; asyncio.run(init_database())"
echo.
echo 4. Run the backend:
echo    uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.
echo 5. Test API endpoints:
echo    - GET http://localhost:8000/docs (Swagger UI)
echo    - GET http://localhost:8000/api/health (Health check)
echo    - POST/GET http://localhost:8000/api/tasks (Task operations)
echo    - GET http://localhost:8000/api/chat (Chat endpoint)
echo.
echo ##########################################################
echo.
echo FRONTEND TESTING:
echo 1. Navigate to frontend directory:
echo    cd frontend
echo.
echo 2. Install dependencies:
echo    npm install
echo.
echo 3. Run the frontend:
echo    npm run dev
echo.
echo 4. Access the application:
echo    - Open http://localhost:3000 in your browser
echo    - Test task creation, editing, completion
echo    - Test priority, tags, due dates, recurrence
echo    - Test real-time sync with multiple browser tabs
echo    - Test AI chatbot functionality
echo    - Test analytics dashboard
echo.
echo ##########################################################
echo.
echo DAPR INTEGRATION TESTING:
echo 1. Make sure Dapr is installed: dapr --version
echo 2. Initialize Dapr: dapr init
echo 3. Run backend with Dapr: dapr run --app-id todo-backend --app-port 8000 -- uvicorn main:app --host 0.0.0.0 --port 8000
echo 4. Verify Dapr sidecar is working by checking http://localhost:3500/v1.0/healthz
echo.
echo ##########################################################
echo.
echo KEY FEATURES TO TEST:
echo - Task CRUD operations
echo - Priority levels (low, medium, high, urgent)
echo - Tagging system
echo - Due dates and overdue highlighting
echo - Recurring tasks
echo - Real-time synchronization
echo - WebSocket connection status
echo - AI chatbot for task management
echo - Analytics dashboard
echo - User preferences
echo - Notification system
echo - Event-driven architecture (check logs)
echo.
echo ##########################################################
echo.
echo NOTE: You may need to install additional dependencies:
echo - Python 3.9+
echo - Node.js 18+
echo - Dapr CLI
echo - Docker (for Dapr)
echo.
echo Press any key to exit...
pause