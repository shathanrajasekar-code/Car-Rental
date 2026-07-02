# Bharath Rental System — Car Rental Administration System

Bharath Rental System is a fully functional, premium, web-based Car Rental Administration System customized for the Indian market, designed as an academic college/university-level semester project. The system handles user roles (Administrator and Customer), reservation calendar overlaps, mock credit-card checkouts, client-side PDF invoice downloads, review submissions, and administrative reports with CSV exports.

---

## 📖 Project Overview & Objectives

The primary objective of the Bharath Rental System is to automate and streamline the vehicle rental lifecycle with localized presets:
1. **Customer Side**: Registration, profile/driving license management, catalog browsing with **Brand-Model Cascading Filters**, Indian budget-to-premium fleet options, date range availability filtering, mock card checkout, invoice downloading, and vehicle review writing.
2. **Admin Side**: Fleet CRUD management, reservation state transitions, client access blocking, analytical KPIs, and CSV data reports.
3. **Unique Indianized Academic Features**:
   - **AI FASTag & Toll Auto-Estimator**: Suggests routes (e.g. Mumbai-Pune Expressway: ₹320) and allows pre-paying tolls.
   - **FASTag Toll Gate Crossing Simulator**: An interactive widget on the user's dashboard to simulate gate crossings and log deductions.
   - **SafarLock Speed Warning Alerts**: Simulates speed limit monitoring (80 km/h in city, 120 km/h on expressways) and alerts admins of violations.
   - **GreenYatra Carbon Offset & Impact Tracker**: Tracks environmental contributions (₹45 offset tree-plantation fee) per trip.
   - **Bharath Yatra Itinerary Planner**: Auto-recommends dhabas, pitstops, and sightseeings based on chosen toll routes.

---

## 🛠️ Technology Stack & Rationale

- **Frontend**: React (Vite) + Tailwind CSS (v3)
  - *React* handles fast, modular component rendering.
  - *Tailwind CSS* provides sleek styling, grid designs, and glassmorphic micro-animations.
  - *Recharts* is used for administrative monthly income graphs.
  - *jsPDF* generates professional PDF invoices client-side.
- **Backend**: Node.js + Express.js
  - Scalable and modular REST API handling database records.
- **Database**: MongoDB + Mongoose
  - Document-based database for flexible relationship linkages and search queries.
- **Authentication**: JWT-based session tokens with bcrypt password hashing.
- **Mock Notifications**: Emails are logged to the console and saved in `server/logs/emails.json` to facilitate offline vivas.

---

## 📊 Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ BOOKING : places
    VEHICLE ||--o{ BOOKING : reserved_in
    BOOKING ||--|| PAYMENT : triggers
    BOOKING ||--o| REVIEW : receives

    USER {
        ObjectId id PK
        string name
        string email UK
        string phone
        string password
        string role "admin / customer"
        string drivingLicense
        boolean isBlocked
    }

    VEHICLE {
        ObjectId id PK
        string name
        string brand
        string model
        number year
        string category "Sedan / SUV / Hatchback / Luxury"
        string transmission "Manual / Automatic"
        string fuelType "Petrol / Diesel / Electric / Hybrid"
        number seats
        number dailyPrice
        string image "relative upload path"
        string plateNumber UK
        string status "Available / Rented / Maintenance"
        string[] features
        string[] rules
    }

    BOOKING {
        ObjectId id PK
        ObjectId customer FK
        ObjectId vehicle FK
        date pickupDate
        date returnDate
        number totalDays
        number totalAmount
        string status "Pending / Confirmed / Ongoing / Completed / Cancelled"
        ObjectId payment FK
        number securityDeposit "₹5,000"
        string tollRoute
        number tollEstimatedAmount
        boolean prepayTolls
        number tollPaidAmount
        object[] tollLogs
        boolean carbonOffset
        number overspeedAlertsCount
    }

    PAYMENT {
        ObjectId id PK
        ObjectId booking FK
        number amount
        string status "Pending / Success / Failed"
        string transactionId UK
        string method "Card"
        date createdAt
    }

    REVIEW {
        ObjectId id PK
        ObjectId customer FK
        ObjectId vehicle FK
        ObjectId booking FK
        number rating "1 to 5 stars"
        string comment
        date createdAt
    }
```

---

## 🚀 Installation & Setup Instructions

Choose either the **Recommended Python CLI Method** (simplest automated setup), the **One-Click Script Launchers**, or the **Manual Terminal Method**.

### Prerequisites
- **Node.js** (v16+ recommended) - [Download](https://nodejs.org/)
- **MongoDB Community Server** (running locally on port 27017) - [Download](https://www.mongodb.com/try/download/community)
- **Python 3.6+** (for the automated Python CLI runner)

---

### Method 1: Python CLI Runner (Recommended)

You can install the local Python package in editable mode which provides a single command `car-rental` (or via Python module run) to automate dependency installation, environment setup, database seeding, and concurrent server execution.

#### Step 1: Install the Package
Open your terminal in the project root directory and run:
```bash
pip install -e .
```

#### Step 2: Set Up dependencies and Config
```bash
car-rental setup
```
*Alternative:* `python -m car_rental_cli.main setup` (use if the Python Scripts directory is not in your system's PATH)

#### Step 3: Seed Database
```bash
car-rental seed
```
*Alternative:* `python -m car_rental_cli.main seed`

#### Step 4: Launch Concurrent Servers
```bash
car-rental start
```
*Alternative:* `python -m car_rental_cli.main start`

This runs both the backend server and frontend client concurrently in the same terminal, prefixing and merging their log outputs dynamically. Press `Ctrl+C` to gracefully terminate both servers.

---

### Method 2: One-Click Script Launchers

We have provided wrapper launcher scripts at the root of the project:
*   **Windows (Command Prompt / Explorer)**: Double-click or run [run.bat](file:///c:/Users/ragul/.gemini/antigravity-ide/scratch/car-rental-admin-system/run.bat).
*   **Bash / macOS / Linux**: Run `./run.sh` or `bash run.sh` using [run.sh](file:///c:/Users/ragul/.gemini/antigravity-ide/scratch/car-rental-admin-system/run.sh).

These scripts automatically verify Node.js and MongoDB, create server `.env`, install client/server dependencies, prompt for database seeding, and launch both servers in separate windows.

---

### Method 3: Manual Terminal Commands (No Python)

If you don't have Python installed, you can perform setup manually:

#### Step 1: Configure Server `.env` File
Create a `.env` file under the `/server` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/car_rental_db
JWT_SECRET=supersecretkeyforcarrentalproject
NODE_ENV=development
```

#### Step 2: Install Node Dependencies
```bash
# Install Server packages
cd server
npm install

# Install Client packages
cd ../client
npm install
```

#### Step 3: Seed Database Demo Data
```bash
cd ../server
npm run seed
```

#### Step 4: Start Development Servers
Run the servers concurrently to start local hosting:
```bash
# Start Backend API (runs on http://localhost:5000)
cd server
npm run dev

# Start Frontend App (runs on http://localhost:5173)
cd ../client
npm run dev
```

---

## 🔑 Demo Login Credentials

You can use the seeded credentials to demonstrate both roles instantly:

| Role | Email Address | Password | Purpose / Features |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@carrental.com` | `customer123` | Browse catalog, select brand/models, pre-pay tolls, simulation gates, and overspeed warning dashboards |
| **Admin** | `admin@carrental.com` | `admin123` | View dashboard charts, monitor overspeeding alerts, CRUD vehicles, update bookings status, block users, export CSV |

---

## 📸 Unique Academic Features & Viva Points
1. **Interactive FASTag Toll Gate Crossings**: Customers can click to trigger a mock toll gate crossing on their booking dashboard. The dashboard updates FASTag balances and creates logs dynamically.
2. **SafarLock Geofence Violations**: Demonstrates simulated speeding (speeding past 120 km/h). An emergency flashing alert is displayed, and the administrator receives real-time overspeed violation alerts linked to the customer's billing.
3. **GreenYatra Carbon Offset**: Allows eco-friendly users to offset 42 kg of CO₂ emissions for ₹45. Keeps a track of the total offset contribution.
4. **Cascading Dropdowns**: Simplifies the vehicle search by filtering models according to selected brands.
