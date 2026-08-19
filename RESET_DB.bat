@echo off
title DOST Academy LMS - Reset Database
color 0C
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
    echo  [ERROR] PHP not found.
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
echo   DOST Academy - Reset Database
echo  ==========================================
echo.
echo  WARNING: Deletes ALL data and reseeds demo data.
echo.
echo  Press any key to continue, or Ctrl+C to cancel...
pause >nul

echo.
echo  Rebuilding database...
"%PHP_PATH%" artisan migrate:fresh --seed --force

echo.
"%PHP_PATH%" dbcheck.php >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Reset failed. See messages above.
) else (
    echo  [OK] Database reset complete.
    echo  Login: admin@dost.gov.ph / password
)
echo.
pause
