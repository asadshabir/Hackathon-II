@echo off
echo Setting up and running Todo AI Chatbot frontend...

REM Navigate to the frontend directory
cd /d "C:\Users\Asad Shabir\Desktop\GIAIC HACKATHON'S\Hackathon-II\Phase-5\frontend"

REM Install dependencies
echo Installing frontend dependencies...
npm install

REM Set environment variables
set NEXT_PUBLIC_API_URL=http://localhost:8000
set NEXT_PUBLIC_WS_URL=ws://localhost:8000

REM Run the application
echo Starting Todo AI Chatbot frontend...
npm run dev

pause