/**
 * Homepage — full-viewport Exchange / Risk / Library / Backspace narrative
 */

'use client';

import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { HomepageFullPageSections } from './homepage/HomepageFullPageSections';

export const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <HomepageFullPageSections />
      </div>

      <Footer />
    </div>
  );
};
