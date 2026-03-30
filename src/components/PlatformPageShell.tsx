/**
 * Shared shell for immersive platform topic pages (full-viewport sections, dark terminal aesthetic)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';

interface PlatformPageShellProps {
  children: React.ReactNode;
}

export const PlatformPageShell: React.FC<PlatformPageShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="bg-[#0a0a0a]/95 border-b border-[#1a1a1a] sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-serif font-bold text-white">General Exchange</span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                Home
              </Link>
              <Link
                to="/request-access"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Get Started
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
};
