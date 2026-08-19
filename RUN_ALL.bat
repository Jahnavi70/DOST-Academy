@echo off
title DOST Academy LMS - Start All
color 0A
cd /d "%~dp0"

echo.
echo  ==========================================
echo   DOST Academy LMS - Starting servers
echo  ==========================================
echo.

:: ---- Find PHP ----
set "PHP_PATH="
where php >nul 2>&1
if not errorlevel 1 (
    for /f "delims=" %%i in ('where php') do if not defined PHP_PATH set "PHP_PATH=%%i"
)
if not defined PHP_PATH if exist "C:\xampp\php\php.exe" set "PHP_PATH=C:\xampp\php\php.exe"
if not defined PHP_PATH if exist "C:\php\php.exe" set "PHP_PATH=C:\php\php.exe"
if not defined PHP_PATH if exist "C:\ProgramData\chocolatey\bin\php.exe" set "PHP_PATH=C:\ProgramData\chocolatey\bin\php.exe"

if not defined PHP_PATH (
    echo  [ERROR] PHP not found. Run setup.bat first.
    pause
    exit /b 1
)

:: ---- Prerequisites ----
if not exist "vendor\autoload.php" (
    echo  [ERROR] Laravel vendor\ missing. Run setup.bat first.
    pause
    exit /b 1
)
if not exist "node_modules" (
    echo  [ERROR] node_modules\ missing. Run setup.bat first.
    pause
    exit /b 1
)
if not exist ".env" (
    echo  [ERROR] .env missing. Run setup.bat first.
    pause
    exit /b 1
)
if not exist "database\database.sqlite" type nul > "database\database.sqlite"

"%PHP_PATH%" dbcheck.php >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Database not seeded. Run setup.bat or RESET_DB.bat.
    pause
    exit /b 1
)

echo  [1/2] Starting backend  http://localhost:8000
start "DOST Backend" cmd /k "cd /d "%~dp0" && "%PHP_PATH%" artisan serve --host=127.0.0.1 --port=8000"

timeout /t 3 /nobreak >nul

echo  [2/2] Starting frontend http://localhost:3000
start "DOST Frontend" cmd /k "cd /d "%~dp0" && npm.cmd start"

echo.
echo  Backend:  http://127.0.0.1:8000
echo  Frontend: http://localhost:3000
echo  Login:    admin@dost.gov.ph / password
echo.
echo  Close this window after servers are up.
echo.
timeout /t 5 /nobreak >nul
