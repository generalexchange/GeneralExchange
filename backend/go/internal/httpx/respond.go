// Package httpx contains shared HTTP response helpers.
package httpx

import (
	"encoding/json"
	"net/http"
	"time"
)

// Envelope is the standard response shape. Per the platform's hard
// constraint, every API response includes the timestamp of the data it is
// based on (AsOf) and the source it was served from.
type Envelope struct {
	Data   any       `json:"data"`
	AsOf   time.Time `json:"as_of"`
	Source string    `json:"source"` // "redis" | "clickhouse" | "mock"
}

// OK writes a 200 JSON envelope.
func OK(w http.ResponseWriter, data any, asOf time.Time, source string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(Envelope{Data: data, AsOf: asOf, Source: source})
}

// Error writes a JSON error with the given status code.
func Error(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"error":  msg,
		"status": status,
		"as_of":  time.Now().UTC(),
	})
}
