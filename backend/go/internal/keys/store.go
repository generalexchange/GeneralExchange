// Package keys implements API-key management for firms: issuance, tiering,
// hashing, lookup, and revocation. Keys are shown in full exactly once (at
// creation); only their SHA-256 hash is retained.
package keys

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"sync"
	"time"
)

// Tier defines the rate + quota allowances for a plan.
type Tier struct {
	Name         string  `json:"name"`
	RPS          float64 `json:"rps"`           // sustained requests/sec
	MonthlyQuota int64   `json:"monthly_quota"` // 0 = unlimited
}

// Tiers are the commercial plans offered to firms.
var Tiers = map[string]Tier{
	"free":       {Name: "free", RPS: 10, MonthlyQuota: 10_000},
	"pro":        {Name: "pro", RPS: 100, MonthlyQuota: 1_000_000},
	"enterprise": {Name: "enterprise", RPS: 1000, MonthlyQuota: 0},
}

// TierFor returns the tier config, defaulting to free for unknown names.
func TierFor(name string) Tier {
	if t, ok := Tiers[name]; ok {
		return t
	}
	return Tiers["free"]
}

// Record is the stored metadata for an issued key (never includes the secret).
type Record struct {
	ID       string    `json:"id"`
	Prefix   string    `json:"prefix"` // displayable head, e.g. gx_live_3f9a
	FirmID   string    `json:"firm_id"`
	Label    string    `json:"label"`
	Tier     string    `json:"tier"`
	Created  time.Time `json:"created"`
	LastUsed time.Time `json:"last_used"`
	Revoked  bool      `json:"revoked"`

	hash string // sha256(raw key), not serialized
}

// Store is an in-memory, concurrency-safe key registry. (A Redis/Postgres
// backing store can implement the same surface without changing callers.)
type Store struct {
	mu      sync.RWMutex
	byHash  map[string]*Record
	byID    map[string]*Record
	enforce bool // strict mode rejects unknown keys
}

// NewStore builds a store. When enforce is false (dev), unknown-but-present
// keys are accepted as anonymous free-tier callers for back-compat.
func NewStore(enforce bool) *Store {
	return &Store{byHash: map[string]*Record{}, byID: map[string]*Record{}, enforce: enforce}
}

// Enforce reports whether unknown keys are rejected.
func (s *Store) Enforce() bool { return s.enforce }

func hashKey(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

func randHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// Create issues a new key for a firm and returns the record plus the raw key.
// The raw key is returned only here and must be surfaced to the caller once.
func (s *Store) Create(firmID, label, tier string) (*Record, string, error) {
	if firmID == "" {
		return nil, "", errors.New("firm_id required")
	}
	if _, ok := Tiers[tier]; !ok {
		tier = "free"
	}
	raw := "gx_live_" + randHex(20)
	rec := &Record{
		ID:       randHex(8),
		Prefix:   raw[:16],
		FirmID:   firmID,
		Label:    label,
		Tier:     tier,
		Created:  time.Now().UTC(),
		LastUsed: time.Time{},
		hash:     hashKey(raw),
	}
	s.mu.Lock()
	s.byHash[rec.hash] = rec
	s.byID[rec.ID] = rec
	s.mu.Unlock()
	return rec, raw, nil
}

// Seed registers a known raw key (used to provision a dev/bootstrap key).
func (s *Store) Seed(raw, firmID, label, tier string) *Record {
	rec := &Record{
		ID:      randHex(8),
		Prefix:  raw[:min(16, len(raw))],
		FirmID:  firmID,
		Label:   label,
		Tier:    tier,
		Created: time.Now().UTC(),
		hash:    hashKey(raw),
	}
	s.mu.Lock()
	s.byHash[rec.hash] = rec
	s.byID[rec.ID] = rec
	s.mu.Unlock()
	return rec
}

// Validate looks up a raw key. The second return is true when the key is known
// and active; it updates LastUsed as a side effect.
func (s *Store) Validate(raw string) (*Record, bool) {
	s.mu.RLock()
	rec, ok := s.byHash[hashKey(raw)]
	s.mu.RUnlock()
	if !ok || rec.Revoked {
		return nil, false
	}
	s.mu.Lock()
	rec.LastUsed = time.Now().UTC()
	s.mu.Unlock()
	return rec, true
}

// List returns the (secret-free) records owned by a firm.
func (s *Store) List(firmID string) []*Record {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []*Record{}
	for _, r := range s.byID {
		if r.FirmID == firmID {
			cp := *r
			out = append(out, &cp)
		}
	}
	return out
}

// AuthResult is the outcome of authorizing a presented key.
type AuthResult int

const (
	// AuthOK — a known, active key.
	AuthOK AuthResult = iota
	// AuthAnonymous — unknown key accepted in lax mode (dev) as free tier.
	AuthAnonymous
	// AuthDenied — revoked, or unknown while strict enforcement is on.
	AuthDenied
)

// Authorize applies the access policy for a presented raw key.
func (s *Store) Authorize(raw string) (*Record, AuthResult) {
	s.mu.RLock()
	rec, ok := s.byHash[hashKey(raw)]
	enforce := s.enforce
	s.mu.RUnlock()

	if ok {
		if rec.Revoked {
			return nil, AuthDenied
		}
		s.mu.Lock()
		rec.LastUsed = time.Now().UTC()
		s.mu.Unlock()
		return rec, AuthOK
	}
	if enforce {
		return nil, AuthDenied
	}
	prefix := raw
	if len(prefix) > 16 {
		prefix = prefix[:16]
	}
	return &Record{ID: "anonymous", FirmID: "anonymous", Tier: "free", Prefix: prefix}, AuthAnonymous
}

// Revoke marks a firm's key revoked. Returns false if not found / not owned.
func (s *Store) Revoke(id, firmID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	rec, ok := s.byID[id]
	if !ok || rec.FirmID != firmID {
		return false
	}
	rec.Revoked = true
	return true
}
