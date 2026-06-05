// Package marketcache serves Polygon market data through Redis with TTLs.
package marketcache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/general-exchange/backend/internal/polygon"
	"github.com/redis/go-redis/v9"
)

const keyPrefix = "ge:market:"
const redisOpTimeout = 800 * time.Millisecond

type Service struct {
	redis   *redis.Client
	polygon *polygon.Client
}

func New(redisURL, polygonKey string) *Service {
	s := &Service{polygon: polygon.NewClient(polygonKey)}
	if redisURL != "" {
		opts, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Printf("level=warn msg=\"invalid REDIS_URL\" err=%v", err)
		} else {
			client := redis.NewClient(opts)
			pingCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
			err := client.Ping(pingCtx).Err()
			cancel()
			if err != nil {
				log.Printf("level=warn msg=\"redis unavailable, cache disabled\" err=%v", err)
				_ = client.Close()
			} else {
				s.redis = client
				log.Printf("level=info msg=\"redis cache enabled\"")
			}
		}
	}
	return s
}

func (s *Service) Ready(ctx context.Context) (redisOK, polygonOK bool) {
	polygonOK = s.polygon.Enabled()
	if s.redis == nil {
		return false, polygonOK
	}
	pingCtx, cancel := context.WithTimeout(ctx, redisOpTimeout)
	defer cancel()
	return s.redis.Ping(pingCtx).Err() == nil, polygonOK
}

func (s *Service) withRedisTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	if deadline, ok := ctx.Deadline(); ok {
		return context.WithDeadline(ctx, deadline)
	}
	return context.WithTimeout(ctx, redisOpTimeout)
}

func (s *Service) cacheKey(parts ...string) string {
	key := keyPrefix
	for i, p := range parts {
		if i > 0 {
			key += ":"
		}
		key += p
	}
	return key
}

type cachedPayload struct {
	Data   json.RawMessage `json:"data"`
	Source string          `json:"source"`
}

func (s *Service) getCached(ctx context.Context, key string) (json.RawMessage, string, bool) {
	if s.redis == nil {
		return nil, "", false
	}
	rctx, cancel := s.withRedisTimeout(ctx)
	defer cancel()
	raw, err := s.redis.Get(rctx, key).Bytes()
	if err != nil {
		return nil, "", false
	}
	var p cachedPayload
	if json.Unmarshal(raw, &p) != nil {
		return nil, "", false
	}
	return p.Data, p.Source, true
}

func (s *Service) setCached(ctx context.Context, key string, data any, source string, ttl time.Duration) {
	if s.redis == nil {
		return
	}
	body, err := json.Marshal(data)
	if err != nil {
		return
	}
	payload, _ := json.Marshal(cachedPayload{Data: body, Source: source})
	rctx, cancel := s.withRedisTimeout(ctx)
	defer cancel()
	if err := s.redis.Set(rctx, key, payload, ttl).Err(); err != nil {
		log.Printf("level=warn msg=\"redis set failed\" key=%s err=%v", key, err)
	}
}

func (s *Service) Quote(ctx context.Context, symbol string) (polygon.QuoteRow, string, error) {
	key := s.cacheKey("quote", symbol)
	if data, _, ok := s.getCached(ctx, key); ok {
		var row polygon.QuoteRow
		if json.Unmarshal(data, &row) == nil {
			return row, "redis", nil
		}
	}
	row, src, err := s.polygon.Quote(symbol)
	if err != nil {
		return polygon.QuoteRow{}, "", err
	}
	s.setCached(ctx, key, row, src, 5*time.Second)
	return row, src, nil
}

func (s *Service) Candles(ctx context.Context, symbol, interval string, limit int) ([]polygon.CandleRow, string, error) {
	key := s.cacheKey("candles", symbol, interval, fmt.Sprintf("%d", limit))
	if data, _, ok := s.getCached(ctx, key); ok {
		var rows []polygon.CandleRow
		if json.Unmarshal(data, &rows) == nil {
			return rows, "redis", nil
		}
	}
	rows, src, err := s.polygon.Candles(symbol, interval, limit)
	if err != nil {
		return nil, "", err
	}
	s.setCached(ctx, key, rows, src, 60*time.Second)
	return rows, src, nil
}

func (s *Service) News(ctx context.Context, symbol string) ([]polygon.NewsRow, string, error) {
	key := s.cacheKey("news", symbol)
	if data, _, ok := s.getCached(ctx, key); ok {
		var rows []polygon.NewsRow
		if json.Unmarshal(data, &rows) == nil {
			return rows, "redis", nil
		}
	}
	rows, src, err := s.polygon.News(symbol)
	if err != nil {
		return nil, "", err
	}
	s.setCached(ctx, key, rows, src, 120*time.Second)
	return rows, src, nil
}

func (s *Service) OptionsChain(ctx context.Context, symbol string) ([]map[string]any, string, error) {
	key := s.cacheKey("chain", symbol)
	if data, _, ok := s.getCached(ctx, key); ok {
		var rows []map[string]any
		if json.Unmarshal(data, &rows) == nil {
			return rows, "redis", nil
		}
	}
	rows, src, err := s.polygon.OptionsChain(symbol)
	if err != nil {
		return nil, "", err
	}
	s.setCached(ctx, key, rows, src, 45*time.Second)
	return rows, src, nil
}
