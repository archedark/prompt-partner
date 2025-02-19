#!/bin/bash

# Start the backend
start "Backend Server" cmd /c "cd backend && npm start"

# Start the frontend
start "Frontend Server" cmd /c "cd frontend && npm start" 