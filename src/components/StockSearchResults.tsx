/**
 * Stock search results component - mock UI until server is connected
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { countCatalogKeys, getCatalogStockByQuery, searchCatalogStocks } from '../data/mockStocksCatalog';

interface StockSearchResultsProps {
  query: string;
}

export const StockSearchResults: React.FC<StockSearchResultsProps> = ({ query }) => {
  const router = useRouter();

  const normalizedQuery = query.trim().toUpperCase();
  const stock = getCatalogStockByQuery(normalizedQuery);

  const matchingStocks = searchCatalogStocks(query, 8);

  if (query.length >= 1 && matchingStocks.length > 0 && !stock) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden z-50">
        <div className="max-h-64 overflow-y-auto">
          {matchingStocks.map((matchStock) => {
            const isPositive = matchStock.change >= 0;
            return (
              <div
                key={matchStock.symbol}
                className="p-3 hover:bg-[#2a2a2a] cursor-pointer border-b border-[#2a2a2a] last:border-b-0"
                onClick={() => router.push(`/company/${matchStock.symbol}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{matchStock.symbol}</span>
                      <span className="text-xs text-gray-400 truncate">{matchStock.name}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      ${matchStock.price.toFixed(2)} • {matchStock.marketCap}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}
                      {matchStock.change.toFixed(2)}
                    </div>
                    <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}
                      {matchStock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-3 bg-[#0f0f0f] border-t border-[#2a2a2a]">
          <p className="text-xs text-gray-500 text-center">
            Showing {matchingStocks.length} of {countCatalogKeys()} stocks
          </p>
        </div>
      </div>
    );
  }

  if (!stock && query.length > 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl p-4 z-50">
        <p className="text-gray-400 text-sm text-center">
          No results found for &quot;{query}&quot;
        </p>
        <p className="text-gray-500 text-xs text-center mt-1">Server connection pending...</p>
      </div>
    );
  }

  if (!stock) return null;

  const isPositive = stock.change >= 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden z-50">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">{stock.symbol}</h3>
            <p className="text-xs sm:text-sm text-gray-400">{stock.name}</p>
          </div>
          <Activity className="w-5 h-5 text-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">${stock.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Change</p>
            <div className="flex items-center space-x-2">
              {isPositive ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
              <div>
                <p className={`text-lg sm:text-xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}
                  {stock.change.toFixed(2)}
                </p>
                <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2a2a2a]">
          <div>
            <p className="text-xs text-gray-500">Volume</p>
            <p className="text-sm font-semibold text-white">{stock.volume}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Market Cap</p>
            <p className="text-sm font-semibold text-white">{stock.marketCap}</p>
          </div>
        </div>

        <button
          onClick={() => router.push(`/company/${stock.symbol}`)}
          className="w-full mt-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          View Full Details
        </button>
      </div>

      <div className="bg-[#0f0f0f] px-4 py-2 border-t border-[#2a2a2a]">
        <p className="text-xs text-gray-500 text-center">💡 Server connection pending - showing mock data</p>
      </div>
    </div>
  );
};
