#!/bin/bash

# Exit if running on Windows
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    echo "Please use start.bat on Windows systems instead of start.sh"
    exit 1
fi

# Kill any existing Node processes
pkill node 2>/dev/null

# Wait a moment to ensure processes are fully terminated
sleep 2

# Start the backend server
cd backend && npm start &

# Wait briefly before launching the next server
sleep 2

# Start the frontend server
cd ../frontend && npm start & 