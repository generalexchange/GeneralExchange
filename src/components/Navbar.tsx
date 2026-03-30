/**
 * Navigation bar — institutional minimal style
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ searchQuery = '', onSearchChange, showSearch = false }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const onHome = location.pathname === '/';

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLink =
    'text-[11px] sm:text-[13px] font-medium tracking-wide text-neutral-400 hover:text-neutral-100 transition-colors whitespace-nowrap';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 border-b ${
        onHome
          ? 'border-white/[0.05] bg-[#0b0c0f]/88 backdrop-blur-xl'
          : 'border-white/[0.05] bg-[#0b0c0f]/92 backdrop-blur-xl'
      } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center gap-4 h-14 sm:h-[3.75rem]">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="w-1.5 h-6 bg-[#c6a575] rounded-full group-hover:bg-[#d4b896] transition-colors" aria-hidden />
            <span className="text-[15px] sm:text-base font-display font-normal text-neutral-100 tracking-tight">
              General Exchange
            </span>
          </Link>

          {showSearch && onSearchChange && (
            <div className="flex-1 max-w-xs sm:max-w-2xl mx-2 sm:mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <Search className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-neutral-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="block w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-white/[0.08] rounded-full bg-white/[0.04] text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#c6a575]/30 focus:border-[#c6a575]/25 transition-all text-xs sm:text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 min-w-0">
            <div className="flex items-center gap-3 sm:gap-5 lg:gap-8 overflow-x-auto scrollbar-hide max-w-[42vw] sm:max-w-none">
              <Link to="/features" className={navLink}>
                Platform
              </Link>
              <Link to="/pricing" className={navLink}>
                Pricing
              </Link>
              <Link to="/university" className={navLink}>
                University
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/request-access"
                className="hidden md:inline-flex text-[13px] font-medium text-neutral-300 hover:text-white px-3 py-2 transition-colors"
              >
                Request access
              </Link>
              <Link
                to="/login"
                className={`inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 border ${
                  isActive('/login')
                    ? 'bg-[#c6a575] border-[#c6a575] text-[#0c0d10]'
                    : 'border-white/[0.12] text-neutral-200 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#c6a575]/35'
                }`}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
