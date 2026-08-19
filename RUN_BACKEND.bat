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
if not defined PHP_PATH if exist "C:\ProgramData\chocolatey\bin\php.exe" set "PHP_PATH=C:\ProgramData\chocolatey\bin\php.exe"

if not defined PHP_PATH (
    echo  [ERROR] PHP not found. Run setup.bat first.
    pause
    exit /b 1
)
if not exist "vendor\autoload.php" (
    echo  [ERROR] vendor\ missing. Run setup.bat first.
    pause
    exit /b 1
)

echo.
echo  ==========================================
echo   DOST Academy - Backend
echo   http://127.0.0.1:8000
echo   Login: admin@dost.gov.ph / password
echo   Stop:  Ctrl+C
echo  ==========================================
echo.
"%PHP_PATH%" artisan serve --host=127.0.0.1 --port=8000
pause
