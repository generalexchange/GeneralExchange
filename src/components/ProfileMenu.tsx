/**
 * Profile dropdown menu for login/logout
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { legendDashboardUrl } from '@/lib/legendUrl';

export const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    console.log('User logged out');
    setIsOpen(false);
    router.push('/');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-colors"
        aria-label="Profile menu"
      >
        <User className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#2a2a2a]">
            <p className="text-sm font-semibold text-white">Account</p>
            <p className="text-xs text-gray-400">user@example.com</p>
          </div>
          
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = legendDashboardUrl('/');
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          <div className="border-t border-[#2a2a2a]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

