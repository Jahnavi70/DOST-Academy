@echo off
title DOST Academy LMS - Start All
color 0A
cd /d "%~dp0"

echo.
echo  ===========================================================
echo   DOST Academy LMS - Starting Application Servers
echo   Team 59 (AstraLink) - IFN735 Industry Project
echo  ===========================================================
echo.

:: ---- Find PHP ----
set "PHP_PATH="
where php >nul 2>&1
if not errorlevel 1 (
    for /f "delims=" %%i in ('where php') do if not defined PHP_PATH set "PHP_PATH=%%i"
)
if not defined PHP_PATH if exist "C:\xampp\php\php.exe" set "PHP_PATH=C:\xampp\php\php.exe"
if not defined PHP_PATH if exist "C:\php\php.exe" set "PHP_PATH=C:\php\php.exe"
if not defined PHP_PATH if exist "C:\tools\php85\php.exe" set "PHP_PATH=C:\tools\php85\php.exe"
if not defined PHP_PATH if exist "C:\tools\php84\php.exe" set "PHP_PATH=C:\tools\php84\php.exe"
if not defined PHP_PATH if exist "C:\tools\php83\php.exe" set "PHP_PATH=C:\tools\php83\php.exe"
if not defined PHP_PATH if exist "C:\tools\php82\php.exe" set "PHP_PATH=C:\tools\php82\php.exe"
if not defined PHP_PATH if exist "C:\Program Files\PHP\php.exe" set "PHP_PATH=C:\Program Files\PHP\php.exe"
if not defined PHP_PATH if exist "C:\Program Files (x86)\PHP\php.exe" set "PHP_PATH=C:\Program Files (x86)\PHP\php.exe"
if not defined PHP_PATH if exist "C:\ProgramData\chocolatey\bin\php.exe" set "PHP_PATH=C:\ProgramData\chocolatey\bin\php.exe"

if not defined PHP_PATH (
    echo  [ERROR] PHP not found. Please install PHP or XAMPP and run setup.bat first.
    pause
    exit /b 1
)

:: ---- Find NPM ----
set "NPM_CMD=npm"
where npm.cmd >nul 2>&1 && set "NPM_CMD=npm.cmd"

:: ---- Prerequisites Check ----
if not exist "vendor\autoload.php" (
    echo  [NOTICE] Backend vendor folder missing. Launching automated setup...
    call "%~dp0setup.bat"
    exit /b %errorlevel%
)
if not exist "node_modules" (
    echo  [NOTICE] Frontend node_modules missing. Launching automated setup...
    call "%~dp0setup.bat"
    exit /b %errorlevel%
)
if not exist ".env" (
    echo  [NOTICE] Configuration .env missing. Launching automated setup...
    call "%~dp0setup.bat"
    exit /b %errorlevel%
)

:: Verify Database Health
"%PHP_PATH%" dbcheck.php >nul 2>&1
if errorlevel 1 (
    echo  [NOTICE] Database needs initialization or seeding. Running setup...
    call "%~dp0setup.bat"
    exit /b %errorlevel%
)

echo  [1/2] Starting Laravel API Backend on http://127.0.0.1:8000 ...
start "DOST Backend (:8000)" cmd /k "cd /d "%~dp0" && "%PHP_PATH%" artisan serve --host=127.0.0.1 --port=8000"

timeout /t 3 /nobreak >nul

echo  [2/2] Starting React Web Portal on http://localhost:3000 ...
start "DOST Frontend (:3000)" cmd /k "cd /d "%~dp0" && %NPM_CMD% start"

timeout /t 4 /nobreak >nul
start http://localhost:3000

echo.
echo  ===========================================================
echo   DOST ACADEMY SERVERS RUNNING
echo  ===========================================================
echo   Web Portal:     http://localhost:3000
echo   API Backend:    http://127.0.0.1:8000
echo.
echo   PRE-REGISTERED DEMO ACCOUNTS (Password: password):
echo   - Super Admin:       admin@dost.gov.ph
echo   - IT Admin:          it.admin@dost.gov.ph
echo   - Functional Admin:  functional.admin@dost.gov.ph
echo   - Faculty Mentor:    asti.mentor@dost.gov.ph
echo   - Employee/Learner:  mark.reyes@dost.gov.ph
echo  ===========================================================
echo.
echo   You may minimize this window. Close the server windows to stop.
echo.
pause
