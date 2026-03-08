@echo off
echo Setting up and running Todo AI Chatbot backend...

REM Navigate to the backend directory
cd /d "C:\Users\Asad Shabir\Desktop\GIAIC HACKATHON'S\Hackathon-II\Phase-5\backend"

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Set environment variables
set DATABASE_URL=sqlite:///./todo_app.db
set GOOGLE_API_KEY=your_google_api_key_here
set SECRET_KEY=your_secret_key_here
set DAPR_HTTP_PORT=3500
set DAPR_GRPC_PORT=50001

REM Run the application
echo Starting Todo AI Chatbot backend...
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause