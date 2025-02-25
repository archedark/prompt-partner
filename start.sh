#!/bin/bash

# Set terminal title
echo -e "\033]0;Promptner Startup Script\007"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Check if npm is installed
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Function to check if a port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use. Please free up the port and try again.${NC}"
        return 1
    fi
    return 0
}

# Check port availability
echo "Checking port availability..."
check_port 3001 || exit 1  # Frontend port
check_port 5001 || exit 1  # Backend port

echo -e "${GREEN}Starting Promptner servers...${NC}"

# Check if dependencies need to be installed
BACKEND_DEPS_NEEDED=0
FRONTEND_DEPS_NEEDED=0

if [ ! -d "backend/node_modules" ]; then
    BACKEND_DEPS_NEEDED=1
fi

if [ ! -d "frontend/node_modules" ]; then
    FRONTEND_DEPS_NEEDED=1
fi

# Install dependencies only if needed
if [ $BACKEND_DEPS_NEEDED -eq 1 ]; then
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    (cd backend && npm ci --no-audit --no-fund)
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install backend dependencies.${NC}"
        exit 1
    fi
fi

if [ $FRONTEND_DEPS_NEEDED -eq 1 ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    (cd frontend && npm ci --no-audit --no-fund)
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install frontend dependencies.${NC}"
        exit 1
    fi
fi

# Start both servers in parallel
echo -e "${YELLOW}Starting backend and frontend servers simultaneously...${NC}"

# Start backend server
(cd backend && npm start) &
BACKEND_PID=$!

# Start frontend server (no waiting)
(cd frontend && npm start) &
FRONTEND_PID=$!

echo -e "${GREEN}Servers are starting. Please wait...${NC}"
echo -e "${YELLOW}Frontend will be available at http://localhost:3001${NC}"
echo -e "${YELLOW}Backend will be available at http://localhost:5001${NC}"

# Keep the script running but allow for clean shutdown with Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 