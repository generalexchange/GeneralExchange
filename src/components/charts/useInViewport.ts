/**
 * Viewport gating for charts.
 *
 * Returns a ref to attach to a chart container and whether it is currently in
 * the viewport. The dashboard uses this to honor the rule that only the chart in
 * focus streams live data: off-screen charts pause their updates until scrolled
 * back into view.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

export function useInViewport<T extends HTMLElement = HTMLDivElement>(
  rootMargin = '120px',
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  return [ref, inView];
}
