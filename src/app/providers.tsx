'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { SolanaWalletProvider } from '@/providers/SolanaWalletProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SolanaWalletProvider>{children}</SolanaWalletProvider>
    </ThemeProvider>
  );
}
