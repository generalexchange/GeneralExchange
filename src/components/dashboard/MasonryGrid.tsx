'use client';

import React from 'react';

type MasonryGridProps = {
  children: React.ReactNode;
  className?: string;
};

/** CSS columns masonry — 1 / 2 / 3 / 4 cols by breakpoint. */
export function MasonryGrid({ children, className = '' }: MasonryGridProps) {
  return (
    <div className={`columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 ${className}`}>
      {children}
    </div>
  );
}

type MasonryItemProps = {
  children: React.ReactNode;
  spanAll?: boolean;
  className?: string;
};

export function MasonryItem({ children, spanAll = false, className = '' }: MasonryItemProps) {
  return (
    <div className={`mb-4 break-inside-avoid ${spanAll ? 'masonry-span-all' : ''} ${className}`}>
      {children}
    </div>
  );
}
