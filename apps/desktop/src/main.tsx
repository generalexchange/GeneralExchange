import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

/**
 * Swap the splash screen for the main window once the UI is mounted.
 * Guarded so the app still runs in a plain browser (vite dev without Tauri).
 * A small minimum delay keeps the splash from flashing on fast machines.
 */
async function revealMainWindow() {
  if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) return;

  try {
    const { Window } = await import('@tauri-apps/api/window');

    const main = await Window.getByLabel('main');
    if (main) {
      await main.show();
      await main.setFocus();
    }

    const splash = await Window.getByLabel('splashscreen');
    if (splash) {
      await splash.close();
    }
  } catch (err) {
    console.error('Failed to reveal main window:', err);
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

const MIN_SPLASH_MS = 1100;
const start = performance.now();
window.addEventListener('load', () => {
  const elapsed = performance.now() - start;
  const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
  window.setTimeout(revealMainWindow, wait);
});
