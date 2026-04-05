/**
 * News / insights article card — BlackRock-style text-forward layout
 */

import React from 'react';
import { NewsArticle } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  /** Insights wire: compact image strip; omit heavy hero image */
  variant?: 'default' | 'insights';
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'default' }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (variant === 'insights') {
    return (
      <article className="group rounded-sm border border-white/[0.08] bg-dark-gray/40 hover:border-tan/30 hover:bg-dark-gray/70 transition-all duration-300 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-institutional-green via-tan to-institutional-green/60 opacity-80" aria-hidden />
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center rounded-sm border border-institutional-green/35 bg-institutional-green/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-tan">
              {article.category}
            </span>
            <span className="text-[11px] text-neutral-500 tabular-nums">{formatDate(article.publishedAt)}</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl text-neutral-50 tracking-tight leading-snug mb-3 group-hover:text-tan transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-neutral-400 leading-relaxed mb-6 line-clamp-3">{article.summary}</p>
          <a
            href={article.url}
            className="inline-flex items-center gap-2 text-sm font-medium text-tan hover:text-tan-muted transition-colors"
          >
            Read More
            <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} aria-hidden />
          </a>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-sm shadow-sm hover:shadow-[0_24px_48px_-20px_rgba(46,90,58,0.2)] transition-all duration-300 overflow-hidden group cursor-pointer border border-white/[0.08] bg-dark-gray hover:border-institutional-green/40">
      <div className="relative h-44 overflow-hidden">
        <img
          src={article.imageUrl}
          alt=""
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-charcoal/85 border border-tan/30 text-tan text-[10px] font-semibold uppercase tracking-wider rounded-sm">
            {article.category}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="font-display text-lg sm:text-xl text-neutral-50 mb-2 line-clamp-2 group-hover:text-tan transition-colors">
          {article.title}
        </h3>

        <p className="text-neutral-400 text-sm mb-5 line-clamp-3 leading-relaxed">{article.summary}</p>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="font-medium text-neutral-400">{article.source}</span>
          <span className="tabular-nums">{formatDate(article.publishedAt)}</span>
        </div>
        <a
          href={article.url}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-tan hover:text-tan-muted transition-colors"
        >
          Read More
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </a>
      </div>
    </article>
  );
};
