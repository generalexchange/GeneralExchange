import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { TOUR_STEPS } from '@/lib/constants';

/**
 * Build the five-step terminal tour. Dismissible at any point; on complete or
 * cancel it calls `onDone` so the caller can persist completion state.
 */
export function createTour(onDone: () => void): Tour {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      scrollTo: false,
      cancelIcon: { enabled: true },
      classes: 'ge-tour-step',
    },
  });

  TOUR_STEPS.forEach((step, index) => {
    const isFirst = index === 0;
    const isLast = index === TOUR_STEPS.length - 1;

    tour.addStep({
      id: step.id,
      title: step.title,
      text: step.text,
      attachTo: { element: step.attachToSelector, on: step.on },
      buttons: [
        ...(!isFirst ? [{ text: 'Back', secondary: true, action: () => tour.back() }] : []),
        isLast
          ? { text: 'Done', action: () => tour.complete() }
          : { text: 'Next', action: () => tour.next() },
      ],
    });
  });

  tour.on('complete', onDone);
  tour.on('cancel', onDone);

  return tour;
}
