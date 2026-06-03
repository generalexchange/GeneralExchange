import { useEffect, useState } from 'react';
import { wsManager } from '@/services/websocket';

/**
 * Subscribe a component to a single WebSocket topic. Returns the most recent
 * payload received on that topic (or null before the first message).
 */
export function useWebSocket<T = unknown>(topic: string | null): T | null {
  const [message, setMessage] = useState<T | null>(null);

  useEffect(() => {
    if (!topic) return;
    setMessage(null);
    const unsubscribe = wsManager.subscribe(topic, (payload) => setMessage(payload as T));
    return unsubscribe;
  }, [topic]);

  return message;
}
