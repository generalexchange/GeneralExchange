// Package metering records per-key API usage for billing + quota enforcement.
// Counters reset at the start of each UTC month. An aggregate snapshot feeds the
// /v1/usage endpoint; emitted events are flushed to the ClickHouse api_usage
// table by the caller.
package metering

import (
	"sync"
	"time"
)

// KeyUsage is the running monthly tally for a single key.
type KeyUsage struct {
	KeyID      string           `json:"key_id"`
	FirmID     string           `json:"firm_id"`
	Requests   int64            `json:"requests"`
	Bytes      int64            `json:"bytes"`
	ByEndpoint map[string]int64 `json:"by_endpoint"`
}

// Event is a single metered request, suitable for warehousing.
type Event struct {
	Time     time.Time
	KeyID    string
	FirmID   string
	Endpoint string
	Method   string
	Status   int
	Bytes    int
}

// Meter aggregates usage in memory and buffers events for warehouse flush.
type Meter struct {
	mu     sync.Mutex
	month  string
	byKey  map[string]*KeyUsage
	events []Event
}

// New builds an empty meter for the current month.
func New() *Meter {
	return &Meter{month: curMonth(), byKey: map[string]*KeyUsage{}}
}

func curMonth() string { return time.Now().UTC().Format("2006-01") }

// rollLocked resets all counters when the UTC month changes. Caller holds mu.
func (m *Meter) rollLocked() {
	if cur := curMonth(); cur != m.month {
		m.month = cur
		m.byKey = map[string]*KeyUsage{}
	}
}

// Record tallies one request and buffers a warehouse event.
func (m *Meter) Record(ev Event) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.rollLocked()
	u, ok := m.byKey[ev.KeyID]
	if !ok {
		u = &KeyUsage{KeyID: ev.KeyID, FirmID: ev.FirmID, ByEndpoint: map[string]int64{}}
		m.byKey[ev.KeyID] = u
	}
	u.Requests++
	u.Bytes += int64(ev.Bytes)
	u.ByEndpoint[ev.Endpoint]++
	m.events = append(m.events, ev)
}

// Count returns the request count for a key this month.
func (m *Meter) Count(keyID string) int64 {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.rollLocked()
	if u, ok := m.byKey[keyID]; ok {
		return u.Requests
	}
	return 0
}

// FirmSnapshot returns the per-key usage for a firm plus the billing month.
func (m *Meter) FirmSnapshot(firmID string) (string, []KeyUsage) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.rollLocked()
	out := []KeyUsage{}
	for _, u := range m.byKey {
		if u.FirmID == firmID {
			cp := *u
			cp.ByEndpoint = map[string]int64{}
			for k, v := range u.ByEndpoint {
				cp.ByEndpoint[k] = v
			}
			out = append(out, cp)
		}
	}
	return m.month, out
}

// DrainEvents returns and clears the buffered warehouse events.
func (m *Meter) DrainEvents() []Event {
	m.mu.Lock()
	defer m.mu.Unlock()
	ev := m.events
	m.events = nil
	return ev
}
