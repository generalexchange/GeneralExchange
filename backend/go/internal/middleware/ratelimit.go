package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/general-exchange/backend/internal/httpx"
	"github.com/general-exchange/backend/internal/keys"
)

// tokenBucket is a simple per-key rate limiter.
type tokenBucket struct {
	tokens   float64
	last     time.Time
	capacity float64
	refill   float64 // tokens per second
}

func (b *tokenBucket) allow() bool {
	now := time.Now()
	elapsed := now.Sub(b.last).Seconds()
	b.last = now
	b.tokens = min(b.capacity, b.tokens+elapsed*b.refill)
	if b.tokens >= 1 {
		b.tokens--
		return true
	}
	return false
}

// Limiter tracks token buckets keyed by caller identity.
type Limiter struct {
	mu       sync.Mutex
	buckets  map[string]*tokenBucket
	rps      float64
	capacity float64
}

// NewLimiter builds a limiter at the given requests-per-second.
func NewLimiter(rps float64) *Limiter {
	return &Limiter{buckets: make(map[string]*tokenBucket), rps: rps, capacity: rps}
}

// allow consumes a token from the bucket for key, sized to rps. A bucket's
// capacity tracks the caller's current tier so plan upgrades take effect.
func (l *Limiter) allow(key string, rps float64) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	b, ok := l.buckets[key]
	if !ok {
		b = &tokenBucket{tokens: rps, last: time.Now(), capacity: rps, refill: rps}
		l.buckets[key] = b
	} else if b.capacity != rps {
		b.capacity, b.refill = rps, rps
	}
	return b.allow()
}

// keyFor identifies a caller: API key, else user id, else remote addr.
func keyFor(r *http.Request) string {
	if k := APIKey(r); k != "" {
		return "key:" + k
	}
	if u := UserID(r); u != "" {
		return "user:" + u
	}
	return "ip:" + r.RemoteAddr
}

// Wrap enforces a fixed rate limit (used by JWT user routes).
func (l *Limiter) Wrap(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !l.allow(keyFor(r), l.rps) {
			w.Header().Set("Retry-After", "1")
			httpx.Error(w, http.StatusTooManyRequests, "rate limit exceeded")
			return
		}
		next(w, r)
	}
}

// WrapTiered enforces the per-key tier's sustained rps (falling back to the
// limiter default when no key record is present).
func (l *Limiter) WrapTiered(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rps := l.rps
		if rec := KeyRecord(r); rec != nil {
			rps = keys.TierFor(rec.Tier).RPS
		}
		if !l.allow(keyFor(r), rps) {
			w.Header().Set("Retry-After", "1")
			httpx.Error(w, http.StatusTooManyRequests, "rate limit exceeded for tier")
			return
		}
		next(w, r)
	}
}
