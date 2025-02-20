#!/bin/bash

# Set title for terminal window
echo -e "\033]0;Prompt Partner Startup Script\007"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed or not in PATH${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    read -p "Press enter to exit..."
    exit 1
fi

# Set port variables
FRONTEND_PORT=3001
BACKEND_PORT=5001

# Function to check if a port is in use
check_port() {
    local port=$1
    local name=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${RED}$name port $port is already in use.${NC}"
        echo "Please stop any running instances before starting new ones."
        echo "Running process details:"
        lsof -i :$port
        echo -e "You can use: ${GREEN}kill -9 [PID]${NC} to stop a specific process"
        read -p "Press enter to exit..."
        exit 1
    fi
}

# Check if ports are in use
check_port $FRONTEND_PORT "Frontend"
check_port $BACKEND_PORT "Backend"

# Check for required .env files
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}Error: backend/.env file is missing${NC}"
    echo "Please create the file with required configuration"
    read -p "Press enter to exit..."
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}Error: frontend/.env file is missing${NC}"
    echo "Please create the file with required configuration"
    read -p "Press enter to exit..."
    exit 1
fi

echo -e "${GREEN}Starting Prompt Partner servers...${NC}"
echo

# Function to start a server
start_server() {
    local dir=$1
    local name=$2
    local port=$3
    
    # Open new terminal window based on available terminal emulator
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $dir && echo 'Installing $name dependencies...' && npm install && echo 'Starting $name server...' && npm start; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -T "$name" -e "cd $dir && echo 'Installing $name dependencies...' && npm install && echo 'Starting $name server...' && npm start; exec bash" &
    elif command -v konsole &> /dev/null; then
        konsole --new-tab -e bash -c "cd $dir && echo 'Installing $name dependencies...' && npm install && echo 'Starting $name server...' && npm start; exec bash" &
    elif command -v terminal &> /dev/null; then
        terminal -- bash -c "cd $dir && echo 'Installing $name dependencies...' && npm install && echo 'Starting $name server...' && npm start; exec bash" &
    else
        # Fallback to running in the same terminal with background process
        echo -e "${RED}No supported terminal emulator found. Running $name in background...${NC}"
        (cd $dir && npm install && npm start &)
    fi
}

# Start backend server
start_server "backend" "Backend" $BACKEND_PORT

# Wait for backend to start
echo "Waiting for backend server to start..."
sleep 5

# Start frontend server
start_server "frontend" "Frontend" $FRONTEND_PORT

echo
echo -e "${GREEN}Servers are starting in separate windows...${NC}"
echo
echo -e "Frontend will be available at: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "Backend will be available at: ${GREEN}http://localhost:$BACKEND_PORT${NC}"
echo
echo "Press Ctrl+C to exit this window (servers will continue running)"

# Keep the script running
while true; do
    sleep 1
done 