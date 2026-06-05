// Command ws is the real-time WebSocket server (port 8081, path /ws).
package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/general-exchange/backend/internal/config"
	"github.com/general-exchange/backend/internal/ws"
)

func main() {
	cfg := config.Load()
	srv := &http.Server{
		Addr:              cfg.WSAddr,
		Handler:           ws.NewServer(cfg),
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("level=info msg=\"go-websocket-server listening\" addr=%s upstream=ibkr symbols=%v",
			cfg.WSAddr, cfg.WSSymbols)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("level=error msg=\"ws server stopped\" err=%v", err)
		}
	}()

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig
	_ = srv.Close()
}
