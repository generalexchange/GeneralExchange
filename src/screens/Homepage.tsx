/**
 * Homepage — full-viewport Exchange / Risk / Library / Backspace narrative.
 *
 * When running inside the Tauri desktop shell (`window.__TAURI_INTERNALS__`
 * is present), the homepage is replaced with DesktopLanding — the full-bleed
 * illustration + animated Sign In / Create Account buttons. The rest of the
 * app (login, dashboard, all routes) works identically in both contexts.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { HomepageFullPageSections } from './homepage/HomepageFullPageSections';
import { DesktopLanding } from '../components/desktop/DesktopLanding';

function useIsTauri() {
  const [isTauri, setIsTauri] = useState(false);
  useEffect(() => {
    setIsTauri(typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window);
  }, []);
  return isTauri;
}

export const Homepage: React.FC = () => {
  const isTauri = useIsTauri();

  if (isTauri) return <DesktopLanding />;

  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} showPricingLink />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <HomepageFullPageSections />
      </div>

      <Footer />
    </div>
  );
};
