@echo off
title DOST Academy LMS - Client Setup
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0CLIENT_SETUP_AND_RUN.ps1"
pause
