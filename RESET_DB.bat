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
echo   DOST Academy - Reset and Re-seed Database
echo  ===========================================================
echo.
echo  WARNING: This will re-seed all 6 DOST agency branches, courses,
echo  lessons, modules, mentors, learners, and demo accounts.
echo.
echo  Press any key to proceed, or Ctrl+C to cancel...
pause >nul

echo.
echo  Rebuilding database schema and running seeders...
"%PHP_PATH%" artisan migrate:fresh --seed --force

echo.
"%PHP_PATH%" dbcheck.php >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Database reset encountered an issue. See output above.
) else (
    echo  [OK] Database successfully reset and seeded!
    echo.
    echo  Pre-registered accounts ready:
    echo  - admin@dost.gov.ph        (password: password)
    echo  - it.admin@dost.gov.ph     (password: password)
    echo  - functional.admin@dost.gov.ph (password: password)
    echo  - asti.mentor@dost.gov.ph  (password: password)
    echo  - mark.reyes@dost.gov.ph   (password: password)
)
echo.
pause
