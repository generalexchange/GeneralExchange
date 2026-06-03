/**
 * Institutional navigation — serif logotype
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
  /** Homepage-only: show Pricing link beside Sign in */
  showPricingLink?: boolean;
}

export const InstitutionalNavbar: React.FC<InstitutionalNavbarProps> = ({
  searchQuery = '',
  onSearchChange,
  showSearch = false,
  showPricingLink = false,
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
      className={`fixed top-0 left-0 right-0 z-50 border-b border-tan/25 bg-dark-gray/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      aria-label="Primary"
    >
      <div className="mx-auto max-w-content layout-gutter">
        <div className="flex min-h-14 items-center justify-between gap-3 sm:min-h-[3.75rem] sm:gap-4">
          <Link href="/" className="-ml-1 inline-flex min-h-11 shrink-0 items-center rounded-md px-1 py-2 sm:min-h-0">
            <span className="font-display text-[1.125rem] sm:text-xl font-medium tracking-tight text-neutral-100">
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
                  className="block w-full border border-white/[0.08] rounded-lg bg-white/[0.04] py-1.5 pr-2 pl-8 text-xs text-neutral-100 placeholder-neutral-500 transition-all focus:border-tan/30 focus:ring-2 focus:ring-institutional-green/35 focus:outline-none sm:py-2 sm:pl-10 sm:pr-3 sm:text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 sm:gap-x-3">
            {showPricingLink ? (
              <Link
                href="/pricing"
                className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-sm font-normal tracking-normal text-white transition-colors hover:text-zinc-200 sm:min-h-0 sm:px-4"
              >
                Pricing
              </Link>
            ) : null}
            <Link
              href="/login"
              className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-[13px] font-semibold tracking-wide transition-all duration-300 sm:min-h-0 sm:px-5 ${
                isActive('/login')
                  ? 'border-tan bg-tan text-charcoal'
                  : 'border-white/[0.12] bg-white/[0.03] text-neutral-200 hover:border-institutional-green/45 hover:bg-institutional-green/20'
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
