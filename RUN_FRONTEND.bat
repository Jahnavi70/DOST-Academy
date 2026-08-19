@echo off
title DOST Academy LMS - Frontend
cd /d "%~dp0"

if not exist "node_modules" (
    echo  [ERROR] node_modules\ missing. Run setup.bat first.
    pause
    exit /b 1
)

echo.
echo  ==========================================
echo   DOST Academy - Frontend
echo   http://localhost:3000
echo   Stop: Ctrl+C
echo  ==========================================
echo.
echo  Waiting for browser to open...
echo.
npm.cmd start
pause
