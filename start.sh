#!/bin/bash

# Start Redis if not running
if ! pgrep redis-server > /dev/null; then
    echo "Starting Redis..."
    brew services start redis
fi

# Start Backend
echo "Starting Backend..."
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "MovieShow is running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "Press CTRL+C to stop everything."

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
