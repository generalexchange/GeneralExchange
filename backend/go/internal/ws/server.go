// Package ws implements the real-time WebSocket server (port 8081).
//
// Streams (per the API design):
//
//	/v1/stream/ticks/{symbol}
//	/v1/stream/candles/{symbol}/{interval}
//	/v1/stream/options/{symbol}        (every 30s)
//	/v1/stream/signals/{symbol}
//	/v1/stream/regime/{symbol}
//	/v1/stream/portfolio               (auth)
//
// Today each stream emits deterministic mock frames on an interval. The real
// path subscribes the connection to the corresponding Redpanda topic and fans
// out frames from Redis. Each connection is capped at 1000 messages/second.
package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/general-exchange/backend/internal/config"
	"github.com/general-exchange/backend/internal/middleware"
	"github.com/general-exchange/backend/internal/mock"
	"github.com/gorilla/websocket"
)

// verifyToken validates the WebSocket auth token (query param).
func verifyToken(token, secret string) (string, bool) { return middleware.VerifyJWT(token, secret) }

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(_ *http.Request) bool { return true }, // tighten in prod
}

type frame struct {
	Stream string    `json:"stream"`
	Symbol string    `json:"symbol,omitempty"`
	AsOf   time.Time `json:"as_of"`
	Data   any       `json:"data"`
}

// NewServer builds the WebSocket mux.
func NewServer(cfg config.Config) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/v1/stream/ticks/{symbol}", stream(900*time.Millisecond, func(r *http.Request) any {
		return mock.Ticks(r.PathValue("symbol"), 1)[0]
	}))
	mux.HandleFunc("/v1/stream/candles/{symbol}/{interval}", stream(time.Second, func(r *http.Request) any {
		return mock.Candles(r.PathValue("symbol"), r.PathValue("interval"), 1)[0]
	}))
	mux.HandleFunc("/v1/stream/options/{symbol}", stream(30*time.Second, func(r *http.Request) any {
		return mock.OptionsChain(r.PathValue("symbol"))
	}))
	mux.HandleFunc("/v1/stream/signals/{symbol}", stream(5*time.Second, func(r *http.Request) any {
		return mock.Signals(r.PathValue("symbol"))[0]
	}))
	mux.HandleFunc("/v1/stream/regime/{symbol}", stream(10*time.Second, func(r *http.Request) any {
		return mock.RegimeState(r.PathValue("symbol"))
	}))
	mux.HandleFunc("/v1/stream/portfolio", streamAuth(cfg.JWTSecret, 2*time.Second, func(userID string) any {
		return mock.PortfolioFor(userID)
	}))

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	return mux
}

// stream upgrades the connection and pushes frames on the given interval.
func stream(interval time.Duration, produce func(*http.Request) any) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		streamName := r.URL.Path
		symbol := r.PathValue("symbol")
		go readPump(conn) // drain control frames / detect close
		pump(conn, interval, streamName, symbol, func() any { return produce(r) })
	}
}

// streamAuth is like stream but requires a valid JWT passed as ?token=.
func streamAuth(secret string, interval time.Duration, produce func(userID string) any) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sub, ok := verifyToken(r.URL.Query().Get("token"), secret)
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		go readPump(conn)
		pump(conn, interval, r.URL.Path, "", func() any { return produce(sub) })
	}
}

func pump(conn *websocket.Conn, interval time.Duration, stream, symbol string, produce func() any) {
	defer conn.Close()
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	send := func() bool {
		f := frame{Stream: stream, Symbol: symbol, AsOf: time.Now().UTC(), Data: produce()}
		b, _ := json.Marshal(f)
		_ = conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
		if err := conn.WriteMessage(websocket.TextMessage, b); err != nil {
			return false
		}
		return true
	}

	if !send() { // immediate first frame
		return
	}
	for range ticker.C {
		if !send() {
			return
		}
	}
}

func readPump(conn *websocket.Conn) {
	conn.SetReadLimit(512)
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			return
		}
	}
}

func init() { log.SetFlags(0) }
