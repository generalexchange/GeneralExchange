// Package middleware provides auth, rate limiting, and logging for the API.
package middleware

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/general-exchange/backend/internal/httpx"
	"github.com/general-exchange/backend/internal/keys"
)

type ctxKey string

const (
	ctxUserID    ctxKey = "user_id"
	ctxAPIKey    ctxKey = "api_key"
	ctxKeyRecord ctxKey = "key_record"
)

// jwtClaims is the minimal claim set we verify.
type jwtClaims struct {
	Sub string `json:"sub"`
	Exp int64  `json:"exp"`
}

// verifyJWT validates an HS256 JWT against the secret without any external
// dependency. Returns the subject (user id) on success.
func verifyJWT(token, secret string) (string, bool) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", false
	}
	signingInput := parts[0] + "." + parts[1]
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signingInput))
	expected := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(expected), []byte(parts[2])) {
		return "", false
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return "", false
	}
	var claims jwtClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return "", false
	}
	if claims.Exp != 0 && time.Now().Unix() > claims.Exp {
		return "", false
	}
	return claims.Sub, true
}

// VerifyJWT validates an HS256 token and returns the subject. Exported for the
// WebSocket server, which receives the token as a query parameter.
func VerifyJWT(token, secret string) (string, bool) { return verifyJWT(token, secret) }

func bearer(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if strings.HasPrefix(strings.ToLower(h), "bearer ") {
		return h[7:]
	}
	return ""
}

// RequireJWT protects routes that act on behalf of a user.
func RequireJWT(secret string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sub, ok := verifyJWT(bearer(r), secret)
		if !ok {
			httpx.Error(w, http.StatusUnauthorized, "invalid or missing JWT")
			return
		}
		ctx := context.WithValue(r.Context(), ctxUserID, sub)
		next(w, r.WithContext(ctx))
	}
}

// RequireAPIKey protects public market-data routes. The presented key is
// authorized against the store; the resolved record (tier/firm) is attached to
// the context for downstream rate limiting + metering.
func RequireAPIKey(store *keys.Store, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get("X-API-Key")
		if key == "" {
			key = r.URL.Query().Get("api_key")
		}
		if key == "" {
			httpx.Error(w, http.StatusUnauthorized, "missing API key")
			return
		}
		rec, result := store.Authorize(key)
		if result == keys.AuthDenied {
			httpx.Error(w, http.StatusUnauthorized, "invalid or revoked API key")
			return
		}
		ctx := context.WithValue(r.Context(), ctxAPIKey, key)
		ctx = context.WithValue(ctx, ctxKeyRecord, rec)
		next(w, r.WithContext(ctx))
	}
}

// UserID extracts the authenticated user id from context.
func UserID(r *http.Request) string {
	if v, ok := r.Context().Value(ctxUserID).(string); ok {
		return v
	}
	return ""
}

// APIKey extracts the caller's API key from context (rate-limit identity).
func APIKey(r *http.Request) string {
	if v, ok := r.Context().Value(ctxAPIKey).(string); ok {
		return v
	}
	return ""
}

// KeyRecord extracts the resolved API-key record (tier/firm) from context.
func KeyRecord(r *http.Request) *keys.Record {
	if v, ok := r.Context().Value(ctxKeyRecord).(*keys.Record); ok {
		return v
	}
	return nil
}
