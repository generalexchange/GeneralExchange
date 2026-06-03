import React, { useEffect, useState } from 'react';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { Terminal } from '@/components/layout/Terminal';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { wsManager } from '@/services/websocket';
import { authApi } from '@/api/auth';
import { getStoredAuth, getAppVersion, checkForUpdate, onTrayCheckUpdates } from '@/lib/tauri';

export const App: React.FC = () => {
  const status = useAuthStore((s) => s.status);
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);
  const setUpdate = useUiStore((s) => s.setUpdate);
  const [version, setVersion] = useState('0.1.0');

  // Wire the WebSocket auth-refresh hook once.
  useEffect(() => {
    wsManager.onTokenExpired = () => authApi.refresh();
  }, []);

  // Startup: hydrate stored token, resolve version, check for updates.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [stored, ver] = await Promise.all([getStoredAuth(), getAppVersion()]);
      if (cancelled) return;
      setVersion(ver);

      if (stored?.token) {
        // Optimistically authenticate; the API client silently refreshes or
        // clears the session if the token turns out to be invalid.
        useAuthStore.setState({
          status: 'authenticated',
          token: stored.token,
          refreshToken: stored.refresh_token,
        });
      } else {
        setUnauthenticated();
      }

      checkForUpdate()
        .then((s) => {
          if (!cancelled && s.available) setUpdate(true, s.version);
        })
        .catch(() => {});
    })();

    return () => {
      cancelled = true;
    };
  }, [setUnauthenticated, setUpdate]);

  // The tray "Check for Updates" item triggers a manual check.
  useEffect(() => {
    let unlisten = () => {};
    onTrayCheckUpdates(() => {
      checkForUpdate()
        .then((s) => setUpdate(s.available, s.version))
        .catch(() => {});
    }).then((fn) => {
      unlisten = fn;
    });
    return () => unlisten();
  }, [setUpdate]);

  if (status === 'unknown') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-charcoal">
        <div className="h-2 w-2 animate-pulse-dot rounded-full bg-tan" />
      </div>
    );
  }

  if (status === 'unauthenticated') return <LoginScreen />;

  return <Terminal version={version} />;
};
