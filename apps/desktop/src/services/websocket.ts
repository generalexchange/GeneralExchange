/**
 * The single WebSocket manager for the terminal.
 *
 * Responsibilities:
 *  - one connection to the general.exchange stream
 *  - topic-based pub/sub with server-side (ref-counted) subscriptions
 *  - JWT handshake on open, token-refresh on 401-style close
 *  - exponential backoff with jitter for all other disconnects
 *  - connection-state reporting into the ui store
 *  - routing every inbound message to the correct Zustand store
 *
 * It contains no business logic. It moves bytes between the backend and the
 * stores, nothing more.
 */

import { WS_URL, Topics } from '@/lib/constants';
import { Backoff } from '@/services/reconnect';
import { getAuthToken } from '@/stores/authStore';
import { useUiStore, type ConnectionState } from '@/stores/uiStore';
import { useMarketStore } from '@/stores/marketStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useSignalStore } from '@/stores/signalStore';
import { useRegimeStore } from '@/stores/regimeStore';
import type { WsMessage } from '@/types/api';

type TopicCallback = (payload: unknown) => void;

// 1008 (policy violation) and the app-specific 4401 both mean "auth rejected".
const AUTH_CLOSE_CODES = new Set([1008, 4401]);

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private backoff = new Backoff();
  private state: ConnectionState = 'disconnected';

  private subscribers = new Map<string, Set<TopicCallback>>();
  private serverTopics = new Map<string, number>(); // topic -> refcount
  private symbolTopics = new Set<string>();

  private intentionalClose = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /** Wired by the app to refresh the JWT when the server rejects auth. */
  public onTokenExpired: (() => Promise<boolean>) | null = null;

  // ---------------------------------------------------------------- lifecycle
  connect(): void {
    if (this.ws && (this.state === 'connected' || this.state === 'connecting')) return;
    this.intentionalClose = false;
    this.setState('connecting');

    try {
      this.ws = new WebSocket(WS_URL);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.backoff.reset();
      this.sendAuth();
      this.resubscribeAll();
      this.setState('connected');
    };

    this.ws.onmessage = (event) => this.handleMessage(event);

    this.ws.onerror = () => {
      // onclose will follow and own the reconnect decision.
    };

    this.ws.onclose = (event) => this.handleClose(event);
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearReconnect();
    this.setState('disconnecting');
    if (this.ws) {
      try {
        this.ws.close(1000, 'client disconnect');
      } catch {
        /* noop */
      }
    }
    this.ws = null;
    this.setState('disconnected');
  }

  getConnectionState(): ConnectionState {
    return this.state;
  }

  // ------------------------------------------------------------------- pub/sub
  subscribe(topic: string, callback: TopicCallback): () => void {
    let set = this.subscribers.get(topic);
    if (!set) {
      set = new Set();
      this.subscribers.set(topic, set);
    }
    set.add(callback);
    this.acquireServerTopic(topic);

    return () => {
      const current = this.subscribers.get(topic);
      if (current) {
        current.delete(callback);
        if (current.size === 0) this.subscribers.delete(topic);
      }
      this.releaseServerTopic(topic);
    };
  }

  publish(topic: string, payload: unknown): void {
    this.send({ type: 'publish', topic, payload });
  }

  /**
   * Replace the set of per-symbol topics the connection follows. Called when
   * the active symbol changes: unsubscribes the old symbol, subscribes the new.
   */
  setSymbolTopics(topics: string[]): void {
    const next = new Set(topics);
    for (const t of this.symbolTopics) {
      if (!next.has(t)) this.releaseServerTopic(t);
    }
    for (const t of next) {
      if (!this.symbolTopics.has(t)) this.acquireServerTopic(t);
    }
    this.symbolTopics = next;
  }

  // -------------------------------------------------------------- internal i/o
  private acquireServerTopic(topic: string): void {
    const count = this.serverTopics.get(topic) ?? 0;
    this.serverTopics.set(topic, count + 1);
    if (count === 0 && this.state === 'connected') {
      this.send({ type: 'subscribe', topics: [topic] });
    }
  }

  private releaseServerTopic(topic: string): void {
    const count = this.serverTopics.get(topic) ?? 0;
    if (count <= 1) {
      this.serverTopics.delete(topic);
      if (this.state === 'connected') this.send({ type: 'unsubscribe', topics: [topic] });
    } else {
      this.serverTopics.set(topic, count - 1);
    }
  }

  private resubscribeAll(): void {
    const topics = Array.from(this.serverTopics.keys());
    if (topics.length > 0) this.send({ type: 'subscribe', topics });
  }

  private sendAuth(): void {
    const token = getAuthToken();
    this.send({ type: 'auth', token });
  }

  private send(obj: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  private handleMessage(event: MessageEvent): void {
    let msg: WsMessage;
    try {
      msg = JSON.parse(event.data as string) as WsMessage;
    } catch {
      return;
    }
    if (!msg || typeof msg.topic !== 'string') return;

    this.routeToStore(msg.topic, msg.payload);

    const set = this.subscribers.get(msg.topic);
    if (set) for (const cb of set) cb(msg.payload);
  }

  private routeToStore(topic: string, payload: unknown): void {
    const kind = topic.split('.')[0];
    switch (kind) {
      case 'ticks':
        useMarketStore.getState().setQuote(payload as never);
        break;
      case 'candles':
        useMarketStore.getState().pushCandle(payload as never);
        break;
      case 'chain': {
        const p = payload as { rows?: unknown[] };
        if (p && Array.isArray(p.rows)) {
          useMarketStore.getState().applyChainSnapshot(payload as never);
        } else if (Array.isArray(payload)) {
          useMarketStore.getState().mergeChainRows(payload as never);
        }
        break;
      }
      case 'signals':
        useSignalStore.getState().addSignal(payload as never);
        break;
      case 'regime':
        useRegimeStore.getState().setRegime(payload as never);
        break;
      case 'news':
        useSignalStore.getState().addNews(payload as never);
        break;
      case 'darkpool':
        useSignalStore.getState().addDarkpool(payload as never);
        break;
      default:
        if (topic === Topics.portfolio) {
          usePortfolioStore.getState().setPortfolio(payload as never);
        }
        // Topics.trades is intentionally only delivered to topic subscribers
        // (the toast hook) so the manager itself stays UI-agnostic.
        break;
    }
  }

  private async handleClose(event: CloseEvent): Promise<void> {
    this.ws = null;
    if (this.intentionalClose) {
      this.setState('disconnected');
      return;
    }

    if (AUTH_CLOSE_CODES.has(event.code) && this.onTokenExpired) {
      this.setState('connecting');
      const refreshed = await this.onTokenExpired();
      if (refreshed) {
        this.connect();
        return;
      }
      // refresh failed — fall through to backoff so we don't hammer auth.
    }

    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    this.clearReconnect();
    this.setState('connecting');
    const delay = this.backoff.next();
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private setState(state: ConnectionState): void {
    if (this.state === state) return;
    this.state = state;
    useUiStore.getState().setConnectionState(state);
  }
}

/** Application-wide singleton. */
export const wsManager = new WebSocketManager();
