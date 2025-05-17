#!/bin/bash

# Promptner startup script for Unix/Linux/macOS
set -e

# Set terminal title
printf '\033]0;Promptner Startup Script\007'

# Ensure Node and npm are available
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Please install Node.js and try again." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed. Please install npm and try again." >&2
  exit 1
fi

# Utility: check if a port is free
check_port() {
  if lsof -Pi :"$1" -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Port $1 is already in use. Please free the port and try again." >&2
    return 1
  fi
  return 0
}

# Utility: run npm install if node_modules is missing
install_if_missing() {
  if [ ! -d "$1/node_modules" ]; then
    echo "Installing dependencies in $1..."
    (cd "$1" && npm install)
  fi
}

# Verify required ports are available
echo "Checking port availability..."
check_port 3001 || exit 1
check_port 5001 || exit 1

# Install dependencies if needed
install_if_missing backend
install_if_missing frontend

# Start backend server
echo "Starting backend server..."
(
  cd backend
  npm start &
  BACKEND_PID=$!
  wait $BACKEND_PID
) &
BACKEND_PID=$!

# Give backend a moment to start
sleep 5

# Start frontend server
echo "Starting frontend server..."
(
  cd frontend
  npm start &
  FRONTEND_PID=$!
  wait $FRONTEND_PID
) &
FRONTEND_PID=$!

echo "Servers are starting."
echo "Frontend: http://localhost:3001"
echo "Backend:  http://localhost:5001"

trap 'kill $BACKEND_PID $FRONTEND_PID' INT
wait $BACKEND_PID $FRONTEND_PID
