@echo off
title DOST Academy LMS - Frontend
cd /d "%~dp0"

:: ---- Find NPM ----
set "NPM_CMD=npm"
where npm.cmd >nul 2>&1 && set "NPM_CMD=npm.cmd"

if not exist "node_modules" (
    echo  [ERROR] node_modules missing. Run setup.bat first.
    pause
    exit /b 1
)

echo.
echo  ===========================================================
echo   DOST Academy - Frontend Web Portal
echo   Starting development server on http://localhost:3000
echo   Stop Server: Press Ctrl+C
echo  ===========================================================
echo.
%NPM_CMD% start
pause
