import React from "react";
import { Link } from "react-router-dom";
import { Home, CloudOff } from "lucide-react";

const NotFoundPage: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center px-4">
    <div className="text-center max-w-md animate-fadeIn">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <CloudOff className="w-10 h-10 text-gray-400" />
      </div>
      <h1 className="text-6xl font-extrabold text-gray-200 dark:text-gray-700 mb-2">
        404
      </h1>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Page not found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary inline-flex items-center gap-2">
        <Home size={16} />
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
