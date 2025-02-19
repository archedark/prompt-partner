@echo off

:: Kill any existing Node processes
taskkill /F /IM node.exe 2>nul

:: Wait a moment to ensure processes are fully terminated
timeout /t 2

:: Start the servers
start "Backend Server" cmd /c "cd backend && npm start"
timeout /t 2
start "Frontend Server" cmd /c "cd frontend && npm start" 