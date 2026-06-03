package metering

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

// usageRow is the JSONEachRow shape matching the ClickHouse api_usage table.
type usageRow struct {
	EventTime     string `json:"event_time"`
	KeyID         string `json:"key_id"`
	FirmID        string `json:"firm_id"`
	Endpoint      string `json:"endpoint"`
	Method        string `json:"method"`
	Status        int    `json:"status"`
	ResponseBytes int    `json:"response_bytes"`
}

// StartFlusher periodically drains buffered events and writes them to ClickHouse
// over its HTTP interface (JSONEachRow insert — no client library needed). When
// chHTTPURL is empty the flusher just drains so memory stays bounded.
func StartFlusher(ctx context.Context, m *Meter, chHTTPURL string, every time.Duration) {
	ticker := time.NewTicker(every)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				flush(m, chHTTPURL)
			}
		}
	}()
}

func flush(m *Meter, chHTTPURL string) {
	events := m.DrainEvents()
	if len(events) == 0 || chHTTPURL == "" {
		return
	}
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	for _, e := range events {
		_ = enc.Encode(usageRow{
			EventTime:     e.Time.UTC().Format("2006-01-02 15:04:05.000"),
			KeyID:         e.KeyID,
			FirmID:        e.FirmID,
			Endpoint:      e.Endpoint,
			Method:        e.Method,
			Status:        e.Status,
			ResponseBytes: e.Bytes,
		})
	}
	url := chHTTPURL + "/?query=" + "INSERT%20INTO%20general_exchange.api_usage%20FORMAT%20JSONEachRow"
	req, err := http.NewRequest(http.MethodPost, url, &buf)
	if err != nil {
		return
	}
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("level=warn msg=\"api_usage flush failed\" err=%v events=%d", err, len(events))
		return
	}
	_ = resp.Body.Close()
}
