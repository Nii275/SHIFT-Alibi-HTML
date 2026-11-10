@echo off
if "%~1"=="--smoke" goto smoke
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launch.ps1"
exit /b %errorlevel%
:smoke
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launch.ps1" -Smoke
exit /b %errorlevel%
