@echo off
title VastuCare Launcher
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ===================================================
echo   VastuCare Smart Sustainable Hospital Launcher
echo ===================================================
echo Root folder: %ROOT%
echo.

echo [1/3] Starting Python ML Microservice (Port 5001)...
start "VastuCare ML Service (Port 5001)" /D "%ROOT%\ml" cmd /k "python ml_service.py"

ping 127.0.0.1 -n 3 > nul

echo [2/3] Starting Express Backend (Port 5000)...
start "VastuCare Backend (Port 5000)" /D "%ROOT%\backend" cmd /k "npm run dev"

ping 127.0.0.1 -n 3 > nul

echo [3/3] Starting React Frontend (Port 3000)...
start "VastuCare Frontend (Port 3000)" /D "%ROOT%\frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo All 3 services have been launched in 3 separate windows!
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo - ML:       http://127.0.0.1:5001
echo ===================================================
echo.
ping 127.0.0.1 -n 5 > nul
start http://localhost:3000
