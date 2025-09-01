# Weather Alert System Backend

## Overview
The Weather Alert System is a full-stack application that provides users with weather alerts based on data fetched from the Tomorrow.io API. The backend is built using Node.js and TypeScript, providing a robust API for the frontend to interact with.

## Table of Contents
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Running the Application](#running-the-application)
- [Testing](#testing)

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/weather-alert-system.git
   ```
2. Navigate to the backend directory:
   ```
   cd weather-alert-system/backend
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Environment Variables
Create a `.env` file in the backend directory and add the following variables:
```
TOMORROW_API_KEY=your_api_key_here
```

## API Endpoints
- `GET /api/weather/alerts`: Fetches current weather alerts.
- `POST /api/weather/alerts`: Creates a new weather alert.

## Running the Application
To start the backend server, run:
```
npm run start
```
The server will run on `http://localhost:5000`.

## Testing
To run tests, use:
```
npm run test
```
Make sure to have your environment variables set up correctly before running tests.

## License
This project is licensed under the MIT License.