// Package ws implements the real-time WebSocket server (port 8081).
//
// Streams are disabled until wired to Redis/Polygon — connections receive
// an error frame instead of synthetic mock data.
package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/general-exchange/backend/internal/config"
	"github.com/general-exchange/backend/internal/middleware"
	"github.com/gorilla/websocket"
)

func verifyToken(token, secret string) (string, bool) { return middleware.VerifyJWT(token, secret) }

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(_ *http.Request) bool { return true },
}

type frame struct {
	Stream string    `json:"stream"`
	Symbol string    `json:"symbol,omitempty"`
	AsOf   time.Time `json:"as_of"`
	Error  string    `json:"error,omitempty"`
}

// NewServer builds the WebSocket mux.
func NewServer(cfg config.Config) http.Handler {
	mux := http.NewServeMux()

	unavailable := func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		defer conn.Close()
		f := frame{
			Stream: r.URL.Path,
			Symbol: r.PathValue("symbol"),
			AsOf:   time.Now().UTC(),
			Error:  "stream unavailable — use REST /v1 endpoints",
		}
		b, _ := json.Marshal(f)
		_ = conn.WriteMessage(websocket.TextMessage, b)
	}

	mux.HandleFunc("/v1/stream/ticks/{symbol}", unavailable)
	mux.HandleFunc("/v1/stream/candles/{symbol}/{interval}", unavailable)
	mux.HandleFunc("/v1/stream/options/{symbol}", unavailable)
	mux.HandleFunc("/v1/stream/signals/{symbol}", unavailable)
	mux.HandleFunc("/v1/stream/regime/{symbol}", unavailable)
	mux.HandleFunc("/v1/stream/portfolio", func(w http.ResponseWriter, r *http.Request) {
		if _, ok := verifyToken(r.URL.Query().Get("token"), cfg.JWTSecret); !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		unavailable(w, r)
	})

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","streams":"disabled"}`))
	})
	return mux
}

func init() { log.SetFlags(0) }
