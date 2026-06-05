// Package config loads runtime configuration from the environment.
package config

import "os"

type Config struct {
	HTTPAddr       string
	WSAddr         string
	JWTSecret      string
	ClickHouseHost string
	ClickHousePort string
	ClickHouseDB   string
	RedisURL           string
	IBKRApiURL         string
	WSSymbols          []string
	RedpandaBroker     string
	BacktestAPIURL     string
	ClickHouseHTTPPort string
	APIKeyEnforce      bool
	DevAPIKey          string
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// Load reads configuration from the environment with sensible dev defaults.
func Load() Config {
	return Config{
		HTTPAddr:       getenv("HTTP_ADDR", ":8080"),
		WSAddr:         getenv("WS_ADDR", ":8081"),
		JWTSecret:      getenv("JWT_SIGNING_SECRET", "change-me-in-prod"),
		ClickHouseHost: getenv("CLICKHOUSE_HOST", "localhost"),
		ClickHousePort: getenv("CLICKHOUSE_PORT", "9000"),
		ClickHouseDB:   getenv("CLICKHOUSE_DB", "general_exchange"),
		RedisURL:       getenv("REDIS_URL", "redis://localhost:6379/0"),
		IBKRApiURL:     getenv("IBKR_API_URL", "http://localhost:8093"),
		WSSymbols:      parseSymbolList(getenv("WS_SYMBOLS", "SPY,QQQ,NVDA,AAPL,TSLA,AMD,MSFT,AMZN,META")),
		RedpandaBroker:     getenv("REDPANDA_BROKERS", "localhost:19092"),
		BacktestAPIURL:     getenv("BACKTEST_API_URL", ""),
		ClickHouseHTTPPort: getenv("CLICKHOUSE_HTTP_PORT", "8123"),
		APIKeyEnforce:      getenv("API_KEY_ENFORCE", "false") == "true",
		DevAPIKey:          getenv("DEV_API_KEY", "gx_live_dev_demo_key"),
	}
}
