/**
 * Breaking news carousel component
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsArticle } from '../types';

interface NewsCarouselProps {
  articles: NewsArticle[];
}

export const NewsCarousel: React.FC<NewsCarouselProps> = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [articles.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  if (articles.length === 0) return null;

  const currentArticle = articles[currentIndex];

  return (
    <div className="relative h-[300px] sm:h-[400px] overflow-hidden bg-[#1a1a1a] border-b border-[#2a2a2a]">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${currentArticle.imageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0f] via-[#0b0c0f]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-12 flex items-end pb-8 sm:pb-12">
        <div className="max-w-3xl">
          <div className="inline-block px-2 sm:px-3 py-1 bg-red-600 text-white text-xs font-bold rounded mb-2 sm:mb-3">
            BREAKING NEWS
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4 leading-tight">
            {currentArticle.title}
          </h2>
          <p className="text-sm sm:text-lg text-gray-300 mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
            {currentArticle.summary}
          </p>
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-400">
            <span className="font-semibold text-white">{currentArticle.source}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{currentArticle.category}</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
        aria-label="Previous"
      >
        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
        aria-label="Next"
      >
        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

