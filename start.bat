@echo off
REM PharmaChain Startup Script for Windows
REM This script starts both the backend and frontend servers

echo ========================================
echo   PharmaChain System Launcher
echo ========================================
echo.

REM Check if node modules exist
echo [1/4] Checking dependencies...
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo Dependencies ready!
echo.

REM Start backend server
echo [2/4] Starting backend server on port 5000...
cd backend
start "PharmaChain Backend" cmd /k "node server.js"
cd ..

REM Wait for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend server
echo [3/4] Starting frontend server on port 3000...
cd frontend
start "PharmaChain Frontend" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo   PharmaChain System is Running!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Close this window to keep servers running.
echo Press Ctrl+C in server windows to stop.
echo ========================================
pause
