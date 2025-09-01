import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Bell, Activity, Sun, Moon } from "lucide-react";
import LogoDark from "../assets/tomorrowio-logo-dark.svg";
import LogoLight from "../assets/tomorrowio-logo-light.svg";

const Navigation: React.FC = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  // Update document class for dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Memoized navigation link styles to prevent recalculation
  const linkStyle = useMemo(
    () => (path: string) =>
      `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        location.pathname === path
          ? "bg-primary text-white"
          : "hover:bg-primary/80 hover:text-white"
      }`,
    [location.pathname]
  );

  return (
    <nav className="bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo + App Name */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={darkMode ? LogoLight : LogoDark}
            alt="Tomorrow.io"
            className="h-8 w-auto"
          />
          <span className="font-bold text-lg">Weather App</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex space-x-4">
          <Link to="/" className={linkStyle("/")}>
            <Home size={18} /> Home
          </Link>
          <Link to="/alerts" className={linkStyle("/alerts")}>
            <Bell size={18} /> Alerts
          </Link>
          <Link to="/status" className={linkStyle("/status")}>
            <Activity size={18} /> Status
          </Link>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 hover:bg-gray-600 dark:hover:bg-gray-300 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
