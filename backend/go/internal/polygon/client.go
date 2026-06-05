// Package polygon fetches market data from Polygon.io / Massive REST API.
package polygon

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

const baseURL = "https://api.polygon.io"

type Client struct {
	apiKey string
	http   *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		http:   &http.Client{Timeout: 8 * time.Second},
	}
}

func (c *Client) Enabled() bool {
	return c != nil && c.apiKey != ""
}

func (c *Client) get(path string, params url.Values) ([]byte, error) {
	if !c.Enabled() {
		return nil, fmt.Errorf("polygon api key not configured")
	}
	q := url.Values{}
	for k, vs := range params {
		for _, v := range vs {
			q.Add(k, v)
		}
	}
	q.Set("apiKey", c.apiKey)
	u := fmt.Sprintf("%s%s?%s", baseURL, path, q.Encode())
	res, err := c.http.Get(u)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	if res.StatusCode >= 400 {
		return nil, fmt.Errorf("polygon %d: %s", res.StatusCode, string(body[:min(len(body), 200)]))
	}
	return body, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func decode[T any](raw []byte) (T, error) {
	var out T
	err := json.Unmarshal(raw, &out)
	return out, err
}
