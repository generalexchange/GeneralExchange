/**
 * Shared shell for marketing pages — soft modern chrome
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface PlatformPageShellProps {
  children: React.ReactNode;
}

export const PlatformPageShell: React.FC<PlatformPageShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0b0c0f] text-white font-sans antialiased selection:bg-[#c6a575]/25">
      <nav className="bg-[#0b0c0f]/92 border-b border-white/[0.05] sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="w-1.5 h-6 rounded-full bg-[#c6a575] group-hover:bg-[#d4b896] transition-colors" />
              <span className="text-base sm:text-lg font-display font-normal text-neutral-100 tracking-tight">General Exchange</span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/"
                className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors hidden sm:inline"
              >
                Home
              </Link>
              <Link
                to="/request-access"
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-neutral-100 text-[#0c0d10] text-sm font-semibold rounded-full hover:bg-white transition-all duration-300 shadow-md shadow-black/15"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
};
