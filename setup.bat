@echo off
title DOST Academy LMS - Setup
color 0A
cd /d "%~dp0"

echo.
echo  ===========================================================
echo   DOST ACADEMY LMS - SETUP
echo   Team 59 (AstraLink) - IFN735
echo  ===========================================================
echo.
echo  Hands-free automated installation: dependencies, database,
echo  migrations, admin seeding, and automated server launch.
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0CLIENT_SETUP_AND_RUN.ps1" %*
set PS_EXIT=%errorlevel%

echo.
if %PS_EXIT% equ 0 (
    echo  ===========================================================
    echo   SETUP COMPLETE
    echo  ===========================================================
    echo.
    echo   Next: Double-click RUN_ALL.bat
    echo   Open:  http://localhost:3000
    echo   Login: admin@dost.gov.ph / password
    echo.
) else (
    echo  ===========================================================
    echo   SETUP FAILED - see errors above
    echo  ===========================================================
    echo.
    echo   Check PHP and Node are installed, then run setup.bat again.
    echo.
)
pause
