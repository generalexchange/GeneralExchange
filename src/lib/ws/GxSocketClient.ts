import { EventEmitter } from 'eventemitter3';
import type {
  CandleEvent,
  MarketDataEvent,
  PortfolioEvent,
  SignalEvent,
  SystemEvent,
  WsChannel,
} from '@gx/event-schema';

interface GxSocketClientOptions {
  url: string;
  symbols: readonly string[];
  channels: readonly WsChannel[];
  reconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
}

type ChannelEvents = {
  md: MarketDataEvent;
  candle: CandleEvent;
  signal: SignalEvent;
  portfolio: PortfolioEvent;
  system: SystemEvent;
  connected: void;
  disconnected: void;
  error: unknown;
};

export class GxSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private lastSeq: Record<WsChannel, number> = {
    md: 0,
    candle: 0,
    signal: 0,
    portfolio: 0,
    system: 0,
  };
  private reconnectDelay: number;
  private maxReconnectDelay: number;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;
  private options: GxSocketClientOptions;

  constructor(options: GxSocketClientOptions) {
    super();
    this.options = options;
    this.reconnectDelay = options.reconnectDelayMs ?? 500;
    this.maxReconnectDelay = options.maxReconnectDelayMs ?? 30_000;
  }

  connect() {
    this.intentionalClose = false;
    this._open();
  }

  disconnect() {
    this.intentionalClose = true;
    this.ws?.close();
  }

  getLastSeq(): Readonly<Record<WsChannel, number>> {
    return { ...this.lastSeq };
  }

  private _open() {
    this.ws = new WebSocket(this.options.url);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      this.reconnectDelay = this.options.reconnectDelayMs ?? 500;
      this.emit('connected');
      this.ws!.send(
        JSON.stringify({
          type: 'subscribe',
          channels: this.options.channels,
          symbols: this.options.symbols,
          last_seq: this.lastSeq,
        }),
      );
    };

    this.ws.onmessage = (evt) => {
      const envelope = JSON.parse(evt.data as string) as {
        ch: WsChannel;
        seq: number;
        data: ChannelEvents[WsChannel];
      };
      const { ch, seq, data } = envelope;
      if (seq > this.lastSeq[ch]) {
        this.lastSeq[ch] = seq;
        this.emit(ch, data);
      }
    };

    this.ws.onclose = () => {
      if (!this.intentionalClose) {
        this.emit('disconnected');
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = (err) => {
      this.emit('error', err);
    };
  }

  private _scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
      this._open();
    }, this.reconnectDelay);
  }
}
