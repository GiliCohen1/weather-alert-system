import React from "react";
import { CloudLightning, Github, ExternalLink } from "lucide-react";

const Footer: React.FC = () => (
  <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-800/60 mt-auto">
    <div className="container mx-auto px-4 py-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-md flex items-center justify-center">
            <CloudLightning size={12} className="text-white" />
          </div>
          <span className="text-sm font-medium">
            WeatherAlert &copy; {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-600 transition flex items-center gap-1"
          >
            API Docs <ExternalLink size={12} />
          </a>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="flex items-center gap-1">
            <Github size={14} />
            Built with React, Express & Prisma
          </span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
