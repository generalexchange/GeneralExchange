/**
 * Institutional navigation — serif logotype
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { marketingSubdomainUrl } from '@/lib/subdomains';

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/95 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      aria-label="Primary"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center gap-4 h-14 sm:h-[3.75rem]">
          <Link href="/" className="shrink-0">
            <span className="font-display text-[1.125rem] sm:text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
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
                  className="block w-full rounded-lg border border-neutral-200 bg-white py-1.5 pr-2 pl-8 text-xs text-neutral-900 placeholder-neutral-500 transition-all focus:border-tan/30 focus:ring-2 focus:ring-institutional-green/35 focus:outline-none sm:py-2 sm:pl-10 sm:pr-3 sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
                />
              </div>
            </div>
          )}

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 sm:gap-x-3">
            <a
              href={marketingSubdomainUrl('university')}
              className="text-[11px] font-semibold tracking-wide text-zinc-400 transition-colors hover:text-tan sm:text-[13px]"
            >
              University
            </a>
            <a
              href={marketingSubdomainUrl('library')}
              className="text-[11px] font-semibold tracking-wide text-zinc-400 transition-colors hover:text-tan sm:text-[13px]"
            >
              Library
            </a>
            <Link
              href="/login"
              className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-[13px] font-semibold tracking-wide transition-all duration-300 sm:px-5 ${
                isActive('/login')
                  ? 'border-tan bg-tan text-charcoal'
                  : 'border-neutral-200 bg-white text-neutral-800 hover:border-institutional-green/45 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
