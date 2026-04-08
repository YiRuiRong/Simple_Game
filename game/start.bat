@echo off
cd /d "%~dp0"

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

:: Start dev server and open browser
start "" http://localhost:5173
npm run dev
