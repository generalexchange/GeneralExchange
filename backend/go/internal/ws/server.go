// Package ws implements the browser-facing WebSocket server with Massive upstream.
//
// Upstream: github.com/massive-com/client-go (Massive / Polygon.io)
// Browser path: /ws — same JSON envelope as shared/ws-types.ts
package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/general-exchange/backend/internal/config"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(_ *http.Request) bool { return true },
}

func deadline() time.Time {
	return time.Now().Add(5 * time.Second)
}

// Server wraps the client hub and optional Massive feed lifecycle.
type Server struct {
	cfg    config.Config
	hub    *Hub
	stopFeed func()
}

// NewServer builds the HTTP mux and starts the Massive upstream feed.
func NewServer(cfg config.Config) http.Handler {
	s := &Server{
		cfg: cfg,
		hub: NewHub(),
	}
	s.stopFeed = StartMassiveFeed(cfg, s.hub)

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", s.handleWS)
	mux.HandleFunc("/", s.handleWS)
	mux.HandleFunc("/health", s.handleHealth)
	mux.HandleFunc("/healthz", s.handleHealth)
	return mux
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok":       true,
		"clients":  s.hub.Count(),
		"symbols":  s.cfg.WSSymbols,
		"massive":  s.cfg.PolygonAPIKey != "",
		"feed":     s.cfg.MassiveWSFeed,
	})
}

func (s *Server) handleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	s.hub.Add(conn)
	go s.readPump(conn)
}

func (s *Server) readPump(conn *websocket.Conn) {
	defer func() {
		s.hub.Remove(conn)
		_ = conn.Close()
	}()
	conn.SetReadLimit(512)
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			return
		}
	}
}

func init() { log.SetFlags(0) }
