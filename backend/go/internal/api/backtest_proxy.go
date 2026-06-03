package api

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"time"
)

// backtestAPIURL points at the Python DuckDB backtesting service. When unset,
// the Go handlers fall back to the in-memory mock so the API is usable without
// the full stack running.
var backtestAPIURL string

var backtestClient = &http.Client{Timeout: 120 * time.Second}

func backtestEnabled() bool { return backtestAPIURL != "" }

// forwardBacktest proxies a JSON request to the Python backtesting service and
// returns the raw response body + status code.
func forwardBacktest(method, path string, body any) (int, []byte, error) {
	var rdr io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return 0, nil, err
		}
		rdr = bytes.NewReader(b)
	}
	req, err := http.NewRequest(method, backtestAPIURL+path, rdr)
	if err != nil {
		return 0, nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := backtestClient.Do(req)
	if err != nil {
		return 0, nil, err
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	return resp.StatusCode, data, err
}

// forwardBacktestRaw proxies a GET and returns the status, body, and the
// upstream Content-Type / Content-Disposition (used for binary exports).
func forwardBacktestRaw(path string) (int, []byte, string, string, error) {
	req, err := http.NewRequest(http.MethodGet, backtestAPIURL+path, nil)
	if err != nil {
		return 0, nil, "", "", err
	}
	resp, err := backtestClient.Do(req)
	if err != nil {
		return 0, nil, "", "", err
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	return resp.StatusCode, data, resp.Header.Get("Content-Type"), resp.Header.Get("Content-Disposition"), err
}

// writeUpstream relays a raw JSON response from the backtesting service.
func writeUpstream(w http.ResponseWriter, status int, body []byte) {
	w.Header().Set("Content-Type", "application/json")
	if status == 0 {
		status = http.StatusBadGateway
	}
	w.WriteHeader(status)
	_, _ = w.Write(body)
}
