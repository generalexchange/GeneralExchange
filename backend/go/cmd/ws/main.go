// Command ws is the real-time WebSocket server (port 8081).
package main

import (
	"log"
	"net/http"

	"github.com/general-exchange/backend/internal/config"
	"github.com/general-exchange/backend/internal/ws"
)

func main() {
	cfg := config.Load()
	log.Printf("level=info msg=\"go-websocket-server listening\" addr=%s", cfg.WSAddr)
	if err := http.ListenAndServe(cfg.WSAddr, ws.NewServer(cfg)); err != nil {
		log.Fatalf("level=error msg=\"ws server stopped\" err=%v", err)
	}
}
