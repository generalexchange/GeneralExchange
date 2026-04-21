'use client';

import React, { useEffect, useState } from 'react';

/**
 * Marketing footer copyright — year from runtime clock so it advances without manual edits.
 */
export function FooterCopyrightLine({ className }: { className?: string }) {
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const y = new Date().getFullYear();
    setYear(y);
    const id = window.setInterval(() => setYear(new Date().getFullYear()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={className ?? 'inline-flex min-h-11 items-center'}>
      © {year} General Exchange
    </span>
  );
}
