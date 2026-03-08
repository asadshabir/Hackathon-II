@echo off
echo Setting up and running Todo AI Chatbot with Dapr...

REM Check if Dapr is installed
dapr --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Dapr is not installed. Installing Dapr...
    powershell -Command "Invoke-WebRequest -OutFile dapr_install.ps1 -Uri http://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; .\dapr_install.ps1 -DownloadPath ."
    del dapr_install.ps1
) else (
    echo Dapr is already installed.
)

REM Initialize Dapr
echo Initializing Dapr...
dapr init

REM Start the backend with Dapr
echo Starting backend with Dapr...
cd /d "C:\Users\Asad Shabir\Desktop\GIAIC HACKATHON'S\Hackathon-II\Phase-5\backend"

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing backend dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Set environment variables
set DATABASE_URL=sqlite:///./todo_app.db
set GOOGLE_API_KEY=your_google_api_key_here
set SECRET_KEY=your_secret_key_here

REM Start backend with Dapr in a new window
start "Todo Backend" cmd /k "dapr run --app-id todo-backend --app-port 8000 --dapr-http-port 3500 --dapr-grpc-port 50001 -- uvicorn main:app --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start the frontend in a new window
echo Starting frontend...
cd /d "C:\Users\Asad Shabir\Desktop\GIAIC HACKATHON'S\Hackathon-II\Phase-5\frontend"

start "Todo Frontend" cmd /k "npm run dev"

echo.
echo Applications are starting...
echo Backend: http://localhost:8000 (with Dapr on http://localhost:3500)
echo Frontend: http://localhost:3000
echo.
echo Dapr Dashboard: http://localhost:8080
echo.
echo Press any key to exit...
pause