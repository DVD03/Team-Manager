@echo off
echo ===================================================
echo Starting ProManager A-Z (Backend & Frontend)...
echo ===================================================

start "ProManager Backend Server (Port 5000)" cmd /k "cd server && node server.js"
start "ProManager Frontend Web App (Port 3000)" cmd /k "cd client && npm run dev -- --port 3000"

echo.
echo Server and Client launched in separate windows!
echo Web Application: http://localhost:3000
echo Backend API: http://localhost:5000
echo.
