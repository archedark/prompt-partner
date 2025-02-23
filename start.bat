@echo off
title Promptner Startup Script

setlocal enabledelayedexpansion

:: Set color codes
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "NC=[0m"

:: Check for Node.js
echo Checking Node.js installation...
node -v > nul 2>&1
if errorlevel 1 (
    echo %RED%Node.js is not installed. Please install Node.js and try again.%NC%
    pause
    exit /b 1
)

:: Check for npm
echo Checking npm installation...
npm -v > nul 2>&1
if errorlevel 1 (
    echo %RED%npm is not installed. Please install npm and try again.%NC%
    pause
    exit /b 1
)

:: Check if ports are available
echo Checking port availability...

:: Check port 3001 (frontend)
netstat -ano | findstr :3001 > nul
if not errorlevel 1 (
    echo %RED%Port 3001 is already in use. Please free up the port and try again.%NC%
    pause
    exit /b 1
)

:: Check port 5001 (backend)
netstat -ano | findstr :5001 > nul
if not errorlevel 1 (
    echo %RED%Port 5001 is already in use. Please free up the port and try again.%NC%
    pause
    exit /b 1
)

echo %GREEN%Starting Promptner servers...%NC%

:: Start backend server
echo %YELLOW%Starting backend server...%NC%
start "Promptner Backend" cmd /k "cd backend && echo Installing backend dependencies... && npm install && echo Starting backend server... && npm start"

:: Wait a moment before starting frontend
timeout /t 5 /nobreak > nul

:: Start frontend server
echo %YELLOW%Starting frontend server...%NC%
start "Promptner Frontend" cmd /k "cd frontend && echo Installing frontend dependencies... && npm install && echo Starting frontend server... && npm start"

echo %GREEN%Servers are starting. Please wait...%NC%
echo %YELLOW%Frontend will be available at http://localhost:3001%NC%
echo %YELLOW%Backend will be available at http://localhost:5001%NC%

:: Keep the window open
pause 