#!/bin/bash

echo "=========================================================="
echo "        🚗 BHARATH CAR RENTAL AUTO LAUNCHER 🚗"
echo "=========================================================="
echo ""

# Step 1: Check Python
echo "[1/5] Checking if Python is installed..."
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null
then
    echo "[ERROR] Python is not installed or not found in PATH."
    echo "Please install Python 3.6+ to proceed."
    read -p "Press any key to exit..."
    exit 1
fi

# Determine python command name
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo "[OK] Python is installed (Version: $($PYTHON_CMD --version))"
echo ""

# Step 2: Install CLI project runner
echo "[2/5] Installing/Updating Python CLI project runner..."
$PYTHON_CMD -m pip install -e . --quiet
if [ $? -ne 0 ]; then
    echo "[WARNING] Failed to run pip install. Attempting to continue using Python module directly."
else
    echo "[OK] Python CLI runner installed successfully."
    chmod +x car_rental_cli/main.py 2>/dev/null
fi
echo ""

# Step 3: Run setup
echo "[3/5] Setting up project dependencies and configurations..."
$PYTHON_CMD -m car_rental_cli.main setup
if [ $? -ne 0 ]; then
    echo "[ERROR] Project setup failed. Make sure Node.js and MongoDB are installed."
    read -p "Press any key to exit..."
    exit 1
fi
echo ""

# Step 4: Ask to seed database
echo "[4/5] Checking Database Seeding..."
read -p "Would you like to seed the database with demo data? (y/n) [default: n]: " SEED
if [[ "$SEED" =~ ^[Yy]$ ]]; then
    echo "Seeding database..."
    $PYTHON_CMD -m car_rental_cli.main seed
else
    echo "[INFO] Skipping database seeding."
fi
echo ""

# Step 5: Start servers and open browser
echo "[5/5] Launching concurrent backend and frontend servers..."
echo "Opening application in default browser..."
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
elif command -v start &> /dev/null; then
    start http://localhost:5173
fi

# Start CLI concurrent runner
$PYTHON_CMD -m car_rental_cli.main start
