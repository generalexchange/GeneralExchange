/**
 * Institutional navigation — serif logotype, tan / green accent border
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

export interface InstitutionalNavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

export const InstitutionalNavbar: React.FC<InstitutionalNavbarProps> = ({
  searchQuery = '',
  onSearchChange,
  showSearch = false,
}) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isActive = (path: string) => pathname === path;

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
    'text-xs sm:text-[13px] font-medium tracking-wide text-neutral-400 hover:text-tan transition-colors whitespace-nowrap';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 border-b border-tan/25 bg-charcoal/92 backdrop-blur-xl ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      aria-label="Primary"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center gap-4 h-14 sm:h-[3.75rem]">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span
              className="w-px h-7 bg-gradient-to-b from-tan to-institutional-green group-hover:opacity-90 transition-opacity"
              aria-hidden
            />
            <span className="font-display text-[1.125rem] sm:text-xl font-medium text-neutral-100 tracking-tight">
              General Exchange
            </span>
          </Link>

          {showSearch && onSearchChange && (
            <div className="flex-1 max-w-xs sm:max-w-2xl mx-2 sm:mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <Search className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-neutral-500" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="block w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-white/[0.08] rounded-sm bg-white/[0.04] text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-institutional-green/35 focus:border-tan/30 transition-all text-xs sm:text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-5 lg:gap-8 min-w-0">
            <div className="flex items-center gap-3 sm:gap-5 lg:gap-7 overflow-x-auto sm:overflow-visible scrollbar-hide max-w-[58vw] sm:max-w-none pr-1">
              <Link href="/features" className={navLink}>
                Trading tools
              </Link>
              <Link href="/pricing" className={navLink}>
                Compute tokens
              </Link>
              <Link href="/bridge-observer" className={navLink}>
                Bridge Observer
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href="/login"
                className={`inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-sm text-[13px] font-semibold tracking-wide transition-all duration-300 border ${
                  isActive('/login')
                    ? 'bg-tan border-tan text-charcoal'
                    : 'border-white/[0.12] text-neutral-200 bg-white/[0.03] hover:bg-institutional-green/20 hover:border-institutional-green/45'
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
