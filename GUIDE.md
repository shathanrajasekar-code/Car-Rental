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

Follow these steps in your PowerShell or Command Prompt terminal:

### Step A: Configure the Environment Variables
Before launching, make sure the backend configuration is correct. Ensure a `.env` file exists at `server/.env` with the following content:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/car_rental_db
JWT_SECRET=supersecretkeyforcarrentalproject
NODE_ENV=development
```

### Step B: Open the Terminal in the Project Directory
Open your PowerShell or Command Prompt and navigate to the project directory:
```powershell
cd "C:\Users\ragul\.gemini\antigravity-ide\scratch\car-rental-admin-system"
```

### Step C: Install Dependencies
Install packages for both the backend (server) and the frontend (client):
```powershell
# 1. Install Server Dependencies
cd server
npm install

# 2. Install Client Dependencies
cd ../client
npm install
```

### Step D: Seed the Database with Sample Data
We need to populate the database with vehicles, an admin account, and a test customer:
```powershell
cd ../server
npm run seed
```
*(You will see a success message in the console indicating that sample data has been inserted into MongoDB)*

### Step E: Start the Development Servers
Start both the backend server and frontend client concurrently:

1.  **Start the Backend Server (Terminal 1):**
    ```powershell
    cd C:\Users\ragul\.gemini\antigravity-ide\scratch\car-rental-admin-system\server
    npm run dev
    ```
    *The server will run on `http://localhost:5000`.*

2.  **Start the Frontend client (Terminal 2):**
    ```powershell
    cd C:\Users\ragul\.gemini\antigravity-ide\scratch\car-rental-admin-system\client
    npm run dev
    ```
    *The client will run on `http://localhost:5173`.*

Open your web browser and navigate to `http://localhost:5173` to view the application!

---

## 🔑 4. Demo Login Credentials
Once the database is seeded, log in using these credentials:

| Role | Email Address | Password | Features |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@carrental.com` | `customer123` | Book vehicles, pre-pay tolls, view driving simulation, offset carbon emissions. |
| **Admin** | `admin@carrental.com` | `admin123` | View analytics charts, CRUD vehicles, update bookings, manage users, export data. |
