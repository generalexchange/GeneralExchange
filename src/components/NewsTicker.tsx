/**
 * CNN/Fox News style scrolling news ticker
 */

import React from 'react';

interface NewsItem {
  id: string;
  text: string;
  category?: string;
}

interface NewsTickerProps {
  news: NewsItem[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ news }) => {
  return (
    <div className="bg-dark-gray border-y border-white/[0.08] overflow-hidden relative">
      <div className="flex items-center h-8 sm:h-10">
        {/* Breaking News Label */}
        <div className="bg-gray-900 px-2 sm:px-4 h-full flex items-center flex-shrink-0 border-r border-gray-800">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        {/* Scrolling News Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-scroll flex items-center space-x-4 sm:space-x-8 whitespace-nowrap">
            {news.concat(news).map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center space-x-2">
                <span className="text-white font-medium text-xs sm:text-sm">
                  {item.category && (
                    <span className="text-blue-400 font-bold mr-1 sm:mr-2">{item.category}:</span>
                  )}
                  {item.text}
                </span>
                <span className="text-gray-600 mx-2 sm:mx-4">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

