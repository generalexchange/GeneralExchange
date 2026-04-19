/**
 * Site footer — institutional column layout
 */

import React from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { marketingSubdomainUrl } from '@/lib/subdomains';

export const InstitutionalFooter: React.FC = () => {
  return (
    <footer className="bg-charcoal border-t border-white/[0.06] py-14 sm:py-16">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-8 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <h3 className="font-display text-lg text-neutral-100 tracking-tight">General Exchange</h3>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed mb-4">
              Consumer interface for tokenized GPU compute on General Exchange
            </p>
            <div className="flex items-center gap-2 text-neutral-600">
              <MapPin className="w-3.5 h-3.5 text-tan/70" strokeWidth={1.5} aria-hidden />
              <span className="text-xs">Fort Worth, Texas</span>
            </div>
          </div>
          <div>
            <a
              href={marketingSubdomainUrl('library')}
              className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-4 inline-block hover:text-tan transition-colors"
            >
              Library
            </a>
            <ul className="space-y-2.5">
              <li>
                <Link href="/features" className="text-sm text-neutral-400 hover:text-tan transition-colors">
                  Trading tools
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-neutral-400 hover:text-tan transition-colors">
                  Compute tokens
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-4">Intelligence</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/bridge-observer" className="text-sm text-neutral-400 hover:text-tan transition-colors">
                  Bridge Observer
                </Link>
              </li>
              <li>
                <Link href="/documents" className="text-sm text-neutral-400 hover:text-tan transition-colors">
                  Documents
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <a
              href={marketingSubdomainUrl('university')}
              className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-4 inline-block hover:text-tan transition-colors"
            >
              University
            </a>
            <ul className="space-y-2.5">
              <li>
                <Link href="/help-center" className="text-sm text-neutral-400 hover:text-tan transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-4">Account</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/login" className="text-sm text-neutral-400 hover:text-tan transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-tan transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-600 text-xs">© {new Date().getFullYear()} General Exchange. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-neutral-600">
            <a href="#" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-neutral-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-neutral-300 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
