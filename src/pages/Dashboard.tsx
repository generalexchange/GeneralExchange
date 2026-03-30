/**
 * Modern minimal dashboard with wallet and investing balance
 */

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Eye, DollarSign } from 'lucide-react';
import { NewsTicker } from '../components/NewsTicker';
import { StockSearchResults } from '../components/StockSearchResults';
import { ProfileMenu } from '../components/ProfileMenu';
import { OptionsModal } from '../components/OptionsModal';
import { OptionsScanner } from '../components/Scanner';
import { TradeInsights } from '../components/TradeInsights';

export const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide header
        setIsHeaderVisible(false);
      } else {
        // Scrolling up - show header
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Mock wallet data - ready for Interactive Brokers integration

  // Mock breaking news for ticker
  const breakingNews = [
    { id: '1', text: 'Markets surge as tech stocks rally 3.5% in morning trading', category: 'MARKETS' },
    { id: '2', text: 'Federal Reserve signals potential rate cut in upcoming meeting', category: 'ECONOMY' },
    { id: '3', text: 'Bitcoin reaches new high above $65,000 amid institutional interest', category: 'CRYPTO' },
    { id: '4', text: 'Major tech company announces $10B share buyback program', category: 'BUSINESS' },
    { id: '5', text: 'Oil prices drop 2% on increased production forecasts', category: 'COMMODITIES' },
    { id: '6', text: 'Unemployment rate falls to 3.8% in latest jobs report', category: 'ECONOMY' },
  ];



  // Handle scanner close (no result needed since it's a standalone scanner)
  const handleScannerClose = () => {
    setIsScannerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0c0f]">
      {/* Minimal Header with Auto-Hide */}
      <nav className={`bg-[#1a1a1a] border-b border-[#2a2a2a] fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-[#1a1a1a]/95 transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <span className="text-lg sm:text-2xl font-serif font-bold text-white">General Exchange</span>
            <div className="flex items-center gap-4">
              {/* Investing Balance */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div className="text-lg font-bold text-white">$127,583</div>
              </div>
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed header */}
      <div className="h-14 sm:h-16"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12 pb-8">
        {/* Search Bar */}
        <div className="py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search stocks (e.g., IBM, AAPL, TSLA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-[#2a2a2a] rounded-lg bg-[#0f0f0f] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm sm:text-base"
              />
              {searchQuery && <StockSearchResults query={searchQuery} />}
            </div>
            
            {/* Options Scanner Button - Far Right */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[44px] sm:min-w-[140px] shadow-lg"
              title="Options Scanner - Find contracts by price, Greeks, and volume"
            >
              <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="hidden sm:inline text-sm font-medium">Options Scanner</span>
            </button>
          </div>
        </div>

        {/* Interactive Brokers Connection Prompt */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8 md:p-12">
              <div className="text-center max-w-2xl mx-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                  Connect Your Interactive Brokers Account
                </h2>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                  Link your Interactive Brokers account to view real-time portfolio data and place trades directly from this dashboard.
                </p>
                <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                  Connect to Interactive Brokers
                </button>
                <p className="text-xs text-gray-500 mt-3 sm:mt-4">
                  Secure OAuth authentication • Your credentials are never stored
                </p>
              </div>
            </div>
            
            {/* News Ticker attached to bottom of IB card */}
            <NewsTicker news={breakingNews} />
          </div>
        </div>

        {/* Trade Insights Section - Real-Time Market Signals */}
        <div className="mb-8 sm:mb-12">
          <TradeInsights />
        </div>

      </div>

      {/* Options Modal */}
      <OptionsModal
        contract={selectedContract}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContract(null);
        }}
      />

      {/* Options Scanner Modal */}
      {isScannerOpen && (
        <OptionsScanner
          onClose={handleScannerClose}
        />
      )}
    </div>
  );
};

