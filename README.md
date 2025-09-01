# Weather Alert System

## Overview
The Weather Alert System is a full-stack application that provides real-time weather alerts using the Tomorrow.io API. The project consists of a React + TypeScript frontend and a Node.js + TypeScript backend, designed to follow best coding practices.

## Features
- Fetches weather data and alerts from the Tomorrow.io API.
- Allows users to create and manage weather alerts.
- Responsive and user-friendly interface built with React.

## Project Structure
```
weather-alert-system
├── backend
│   ├── src
│   │   ├── app.ts
│   │   ├── controllers
│   │   │   └── weatherController.ts
│   │   ├── routes
│   │   │   └── weatherRoutes.ts
│   │   ├── services
│   │   │   └── tomorrowApiService.ts
│   │   └── types
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── App.tsx
│   │   ├── components
│   │   │   └── WeatherAlert.tsx
│   │   ├── services
│   │   │   └── api.ts
│   │   ├── types
│   │   │   └── index.ts
│   │   └── styles
│   │       └── App.css
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── .gitignore
└── README.md
```

## Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file and add your Tomorrow.io API key:
   ```
   TOMORROW_API_KEY=your_api_key_here
   ```
4. Start the server:
   ```
   npm run start
   ```

## Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the React application:
   ```
   npm run start
   ```

## Deployment
### Frontend
To deploy the frontend on GitHub Pages:
1. Build the application:
   ```
   npm run build
   ```
2. Deploy to GitHub Pages:
   ```
   npm run deploy
   ```

### Backend
For backend deployment, consider using services like Heroku, AWS, or DigitalOcean. Follow their respective documentation for deployment steps.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.