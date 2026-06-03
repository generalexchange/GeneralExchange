import { useEffect, useRef } from 'react';
import type { Tour } from 'shepherd.js';
import { createTour } from './tour';
import { markTourCompleted } from '@/lib/tauri';
import { useUiStore } from '@/stores/uiStore';

interface Props {
  /** bump this number to (re)start the tour on demand (e.g. help button) */
  runToken: number;
  /** whether the tour should auto-run (first launch and not yet completed) */
  autoRun: boolean;
}

/**
 * Headless controller that owns the Shepherd tour lifecycle. Mounted once inside
 * the terminal. Starts on first launch and whenever `runToken` increments.
 */
export const OnboardingTour: React.FC<Props> = ({ runToken, autoRun }) => {
  const tourRef = useRef<Tour | null>(null);
  const setTourCompleted = useUiStore((s) => s.setTourCompleted);

  useEffect(() => {
    if (runToken === 0 && !autoRun) return;

    // The anchors must exist; defer one frame so the layout has painted.
    const id = window.requestAnimationFrame(() => {
      const tour = createTour(() => {
        markTourCompleted();
        setTourCompleted(true);
      });
      tourRef.current = tour;
      tour.start();
    });

    return () => {
      window.cancelAnimationFrame(id);
      tourRef.current?.complete();
      tourRef.current = null;
    };
  }, [runToken, autoRun, setTourCompleted]);

  return null;
};
