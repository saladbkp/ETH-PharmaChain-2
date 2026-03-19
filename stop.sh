#!/bin/bash

# PharmaChain Stop Script
# This script stops all running Node.js processes for the project

echo "🛑 Stopping PharmaChain servers..."

# Kill backend server on port 5000
BACKEND_PID=$(lsof -ti:5000)
if [ ! -z "$BACKEND_PID" ]; then
    echo "Stopping backend server (PID: $BACKEND_PID)..."
    kill -9 $BACKEND_PID 2>/dev/null
    echo "✅ Backend stopped"
else
    echo "ℹ️  No backend server running on port 5000"
fi

# Kill frontend server on port 3000
FRONTEND_PID=$(lsof -ti:3000)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "Stopping frontend server (PID: $FRONTEND_PID)..."
    kill -9 $FRONTEND_PID 2>/dev/null
    echo "✅ Frontend stopped"
else
    echo "ℹ️  No frontend server running on port 3000"
fi

# Also kill any node processes running server.js or react-scripts
pkill -f "node server.js" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null

# Additional cleanup - kill all node processes in the project directories
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
pkill -9 -f "$PROJECT_DIR/backend" 2>/dev/null
pkill -9 -f "$PROJECT_DIR/frontend" 2>/dev/null

echo "✅ All servers stopped"
echo ""
echo "Ports 5000 and 3000 are now available"
