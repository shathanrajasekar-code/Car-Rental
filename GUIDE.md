# 🚗 Car Rental Administration System - Setup & Run Guide

This guide provides instructions on how to install dependencies, navigate to the correct folders on your computer, and run the application.

---

## 📌 1. Where to Go in Your Computer (Project Location)
The project files are located at:
📁 **`C:\Users\ragul\.gemini\antigravity-ide\scratch\car-rental-admin-system`**

### Quick Directory Map:
*   `C:\Users\ragul\.gemini\antigravity-ide\scratch\car-rental-admin-system/` (Root directory)
    *   `client/` (Frontend React code)
    *   `server/` (Backend Node.js API code)

---

## 🛠️ 2. What to Install (Prerequisites)

Before running the application, make sure you have the following software installed on your computer:

1.  **Node.js (v16 or higher)**
    *   *Why?* To run the JavaScript package manager (`npm`) and execute the frontend and backend servers.
    *   *How to download:* Go to [nodejs.org](https://nodejs.org/) and download the **LTS (Long Term Support)** version.
2.  **MongoDB Community Server**
    *   *Why?* To host the local database for storing user accounts, vehicles, and reservation bookings.
    *   *How to download:* Go to [MongoDB Community Server Download Page](https://www.mongodb.com/try/download/community) and download the MSI installer. Follow the setup wizard and make sure "Install MongoDB as a Service" is checked so that the database runs automatically in the background.

---

## 🚀 3. How to Run the Application

You can launch the application using one of the three options below:

---

### Option A: Python CLI Runner (Automated & Recommended)
This is the simplest way to get everything configured and running in a single terminal.

#### Step 1: Open Terminal in Project Directory
Open PowerShell or Command Prompt and run:
```powershell
cd "C:\Users\ragul\.gemini\antigravity-ide\scratch\car-rental-admin-system"
```

#### Step 2: Install the CLI Package
Install the project CLI locally using `pip`:
```powershell
pip install -e .
```

#### Step 3: Run the Setup
Installs all backend and frontend Node packages and verifies prerequisites:
```powershell
car-rental setup
```
*(If the `car-rental` command is not found in your environment PATH, use `python -m car_rental_cli.main setup` instead)*

#### Step 4: Seed/Reset Database
Populates the database with default cars, customers, and admin accounts:
```powershell
car-rental seed
```
*(Or use: `python -m car_rental_cli.main seed`)*

#### Step 5: Start Both Servers
Starts the client and server concurrently, streaming and prefixing logs in the same window:
```powershell
car-rental start
```
*(Or use: `python -m car_rental_cli.main start`)*

Once started, open `http://localhost:5173` in your browser. To stop the servers, simply press `Ctrl+C` in the terminal.

---

### Option B: One-Click Script Launcher
We have provided automated wrapper scripts at the root of the project to set up and launch everything:
*   **Windows**: Double-click or run [run.bat](file:///c:/Users/ragul/.gemini/antigravity-ide/scratch/car-rental-admin-system/run.bat).
*   **macOS / Linux / Git Bash**: Run `bash run.sh` using [run.sh](file:///c:/Users/ragul/.gemini/antigravity-ide/scratch/car-rental-admin-system/run.sh).

1. Make sure **MongoDB** is running locally on your computer.
2. Double-click the **`run.bat`** file.
3. The script will automatically check Node.js and MongoDB, create server `.env`, install frontend/backend dependencies, prompt you to seed the database, launch both servers in separate windows, and open `http://localhost:5173`.

---

### Option C: Manual Terminal Execution (No Python)
If you don't have Python, follow these manual steps in your terminal:

#### Step 1: Configure Environment Variables
Create a `.env` file at `server/.env` with the following content:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/car_rental_db
JWT_SECRET=supersecretkeyforcarrentalproject
NODE_ENV=development
```

#### Step 2: Install Node Dependencies
```powershell
# 1. Install Server Dependencies
cd server
npm install

# 2. Install Client Dependencies
cd ../client
npm install
```

#### Step 3: Seed Database
```powershell
cd ../server
npm run seed
```

#### Step 4: Start Backend Server
In a new terminal window:
```powershell
cd C:\Users\ragul\.gemini\antigravity-ide\scratch\car-rental-admin-system\server
npm run dev
```

#### Step 5: Start Frontend Client
In another terminal window:
```powershell
cd C:\Users\ragul\.gemini\antigravity-ide\scratch\car-rental-admin-system\client
npm run dev
```

Open `http://localhost:5173` to view the application!

---

## 🔑 4. Demo Login Credentials
Once the database is seeded, log in using these credentials:

| Role | Email Address | Password | Features |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@carrental.com` | `customer123` | Book vehicles, pre-pay tolls, view driving simulation, offset carbon emissions. |
| **Admin** | `admin@carrental.com` | `admin123` | View analytics charts, CRUD vehicles, update bookings, manage users, export data. |
