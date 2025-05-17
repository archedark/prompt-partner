#!/bin/bash

# Set terminal title
echo -e "\033]0;Promptner Startup Script\007"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

# Install dependencies only if node_modules is missing
npm_cmd_install() {
    if [ ! -d "$1/node_modules" ]; then
        echo "Installing dependencies in $1..."
        (cd "$1" && npm install)
    fi
}

# Check port availability
echo "Checking port availability..."
check_port 3001 || exit 1  # Frontend port
check_port 5001 || exit 1  # Backend port

echo -e "${GREEN}Starting Promptner servers...${NC}"

# Start backend server
echo -e "${YELLOW}Starting backend server...${NC}"

npm_cmd_install backend && \
cd backend && \
echo "Starting backend server..." && \
npm start &

cd ..

# Wait a moment before starting frontend
sleep 5

# Start frontend server
echo -e "${YELLOW}Starting frontend server...${NC}"
npm_cmd_install frontend && \
cd frontend && \
echo "Starting frontend server..." && \
npm start &

echo -e "${GREEN}Servers are starting. Please wait...${NC}"
echo -e "${YELLOW}Frontend will be available at http://localhost:3001${NC}"
echo -e "${YELLOW}Backend will be available at http://localhost:5001${NC}"

# Keep the script running
wait 