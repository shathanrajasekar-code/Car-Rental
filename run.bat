@echo off
title Bharath Car Rental Auto Launcher
setlocal enabledelayedexpansion

echo ==========================================================
echo        🚗 BHARATH CAR RENTAL AUTO LAUNCHER 🚗
echo ==========================================================
echo.

:: Step 1: Check Python
echo [1/5] Checking if Python is installed...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not found in PATH.
    echo Please install Python 3.6+ and make sure "Add Python to PATH" is checked.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PY_VER=%%i
echo [OK] Python is installed (Version: %PY_VER%)
echo.

:: Step 2: Install CLI project runner
echo [2/5] Installing/Updating Python CLI project runner...
python -m pip install -e . --quiet
if %errorlevel% neq 0 (
    echo [WARNING] Failed to run pip install. Attempting to continue using Python module directly.
) else (
    echo [OK] Python CLI runner installed successfully.
)
echo.

:: Step 3: Run setup
echo [3/5] Setting up project dependencies and configurations...
python -m car_rental_cli.main setup
if %errorlevel% neq 0 (
    echo [ERROR] Project setup failed. Make sure Node.js and MongoDB are installed.
    pause
    exit /b 1
)
echo.

:: Step 4: Ask to seed database
echo [4/5] Checking Database Seeding...
set /p SEED="Would you like to seed the database with demo data? (y/n) [default: n]: "
if /I "%SEED%"=="y" (
    echo Seeding database...
    python -m car_rental_cli.main seed
) else (
    echo [INFO] Skipping database seeding.
)
echo.

:: Step 5: Start servers and open browser
echo [5/5] Launching concurrent backend and frontend servers...
echo Opening application in default browser...
start http://localhost:5173

:: Start CLI concurrent runner
python -m car_rental_cli.main start

pause
