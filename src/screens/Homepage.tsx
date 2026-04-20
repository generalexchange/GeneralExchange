/**
 * Homepage — full-viewport TradeEngine / Risk / Library / Backspace narrative
 */

'use client';

import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { HomepageFullPageSections } from './homepage/HomepageFullPageSections';

export const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper-50 font-sans text-graphite-800 antialiased selection:bg-brass/25">
      <Navbar showSearch={false} />

      <div className="pt-12 sm:pt-14">
        <HomepageFullPageSections />
      </div>

      <Footer />
    </div>
  );
};
