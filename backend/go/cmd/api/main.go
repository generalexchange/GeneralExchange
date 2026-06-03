// Command api is the primary Go REST data API (port 8080).
package main

import (
	"log"
	"net/http"
	"time"

	"github.com/general-exchange/backend/internal/api"
	"github.com/general-exchange/backend/internal/config"
)

func main() {
	cfg := config.Load()
	srv := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           api.NewRouter(cfg),
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      30 * time.Second,
	}
	log.Printf("level=info msg=\"go-api-server listening\" addr=%s", cfg.HTTPAddr)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("level=error msg=\"server stopped\" err=%v", err)
	}
}
