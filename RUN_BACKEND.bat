@echo off
title DOST Academy LMS - Backend
cd /d "%~dp0"

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
if not exist "vendor\autoload.php" (
    echo  [ERROR] vendor folder missing. Run setup.bat first.
    pause
    exit /b 1
)

echo.
echo  ===========================================================
echo   DOST Academy - Backend API Server
echo   Listening on http://127.0.0.1:8000
echo   Stop Server: Press Ctrl+C
echo  ===========================================================
echo.
"%PHP_PATH%" artisan serve --host=127.0.0.1 --port=8000
pause
