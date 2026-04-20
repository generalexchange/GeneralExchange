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
    <div className="min-h-screen bg-dark-gray font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-12 sm:pt-14">
        <HomepageFullPageSections />
      </div>

      <Footer />
    </div>
  );
};
