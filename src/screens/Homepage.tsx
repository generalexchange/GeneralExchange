/**
 * Homepage — full-viewport TradeEngine / Risk / Strategies / History / Backspace narrative
 */

'use client';

import React from 'react';
import { Navbar } from '../components/Navbar';
import { InstitutionalFooter } from '../components/InstitutionalFooter';
import { HomepageFullPageSections } from './homepage/HomepageFullPageSections';

export const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-14 sm:pt-[3.75rem]">
        <HomepageFullPageSections />
      </div>

      <InstitutionalFooter />
    </div>
  );
};
