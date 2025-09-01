import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navigation from "./pages/Navigation";
import Home from "./pages/HomePage";
import Alerts from "./pages/AlertsPage";
import Status from "./pages/StatusPage";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
