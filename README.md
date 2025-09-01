# 🌦️ Weather Alert System

A full-stack application that allows users to create custom weather alerts.  
The system periodically evaluates stored alerts against live weather data and notifies when conditions are met.  

## 📂 Source
Repository: [Weather Alert System](https://github.com/GiliCohen1/weather-alert-system)

## ⚡ Execution Method

This project is designed to run **locally**.  
Follow the steps below to set up both the **backend (Node.js + Express + PostgreSQL)** and **frontend (React + Vite)**.

## 🛠️ Prerequisites

Before running, make sure you have:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/download/) (installed locally)
- Git (for cloning the repository)


## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/GiliCohen1/weather-alert-system.git
cd weather-alert-system
```

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a .env file in the backend/ directory:

PORT=5000
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/weather_alerts
EVALUATION_INTERVAL_MINUTES=5


Replace <username> and <password> with your local PostgreSQL credentials.

Initialize the database:
```bash
psql -U <username> -d postgres -f migrations/init.sql
```

This will create the weather_alerts database and the required tables.

Start the backend server:
```bash
npm run dev
```

The backend will run on:
👉 http://localhost:5000/api

### 3. Frontend Setup

Open a new terminal and navigate to the frontend:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the frontend:
```bash
npm run dev
```

The frontend will run on:
👉 http://localhost:5173
