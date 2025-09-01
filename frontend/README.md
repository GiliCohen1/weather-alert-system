# Weather Alert System - Frontend Documentation

## Overview

The Weather Alert System is a full-stack application that provides real-time weather alerts using the Tomorrow.io API. This frontend is built with React and TypeScript, offering a user-friendly interface for users to create and view weather alerts.

## Features

- Create new weather alerts based on user-defined criteria.
- View a list of existing weather alerts.
- Responsive design for optimal viewing on various devices.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/GiliCohen1/weather-alert-system.git
   ```
2. Navigate to the frontend directory:
   ```
   cd weather-alert-system/frontend
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Running the Application

To start the development server, run:

```
npm start
```

This will launch the application in your default web browser at `http://localhost:3000`.

### Building for Production

To create a production build of the application, run:

```
npm run build
```

This will generate a `build` directory containing the optimized application files.

## Deployment

For deployment on GitHub Pages, follow these steps:

1. Install the `gh-pages` package:
   ```
   npm install --save gh-pages
   ```
2. Add the following properties to your `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/weather-alert-system/frontend",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Deploy the application:
   ```
   npm run deploy
   ```

## API Integration

The frontend communicates with the backend API to fetch and manage weather alerts. Ensure that the backend service is running and accessible for the frontend to function correctly.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
