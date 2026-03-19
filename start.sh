#!/bin/bash

# PharmaChain Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Starting PharmaChain System..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup SIGINT SIGTERM

# Kill any existing processes on ports 5000 and 3000
echo "🧹 Cleaning up ports..."
BACKEND_PORT_PID=$(lsof -ti:5000 2>/dev/null)
FRONTEND_PORT_PID=$(lsof -ti:3000 2>/dev/null)

if [ ! -z "$BACKEND_PORT_PID" ]; then
    echo "  Killing process on port 5000 (PID: $BACKEND_PORT_PID)"
    kill -9 $BACKEND_PORT_PID 2>/dev/null
fi

if [ ! -z "$FRONTEND_PORT_PID" ]; then
    echo "  Killing process on port 3000 (PID: $FRONTEND_PORT_PID)"
    kill -9 $FRONTEND_PORT_PID 2>/dev/null
fi

# Also kill any lingering node processes for this project
pkill -f "node server.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null

echo "✅ Ports cleaned"
echo ""

# Check if node modules exist
echo "📦 Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ Dependencies ready"

# Fix permissions for react-scripts
if [ -f "frontend/node_modules/.bin/react-scripts" ]; then
    chmod +x frontend/node_modules/.bin/react-scripts 2>/dev/null
fi

echo ""

# Start backend server
echo "🔧 Starting backend server on port 5000..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Failed to start backend server"
    exit 1
fi

echo "✅ Backend server started (PID: $BACKEND_PID)"
echo ""

# Start frontend server
echo "🎨 Starting frontend server on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Frontend server started (PID: $FRONTEND_PID)"
echo ""
echo "═══════════════════════════════════════════════════"
echo "🎉 PharmaChain System is now running!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📱 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "═══════════════════════════════════════════════════"
echo ""

# Wait for any process to exit
wait
