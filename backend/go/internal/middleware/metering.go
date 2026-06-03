package middleware

import (
	"net/http"
	"time"

	"github.com/general-exchange/backend/internal/httpx"
	"github.com/general-exchange/backend/internal/keys"
	"github.com/general-exchange/backend/internal/metering"
)

// meteredWriter captures the status code and response size for billing.
type meteredWriter struct {
	http.ResponseWriter
	status int
	bytes  int
}

func (m *meteredWriter) WriteHeader(code int) {
	m.status = code
	m.ResponseWriter.WriteHeader(code)
}

func (m *meteredWriter) Write(b []byte) (int, error) {
	n, err := m.ResponseWriter.Write(b)
	m.bytes += n
	return n, err
}

// Metered enforces the monthly quota for the caller's tier, then records the
// request (count + bytes + endpoint) for billing and warehouse flush.
func Metered(meter *metering.Meter, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rec := KeyRecord(r)
		if rec != nil {
			if quota := keys.TierFor(rec.Tier).MonthlyQuota; quota > 0 && meter.Count(rec.ID) >= quota {
				w.Header().Set("Retry-After", "86400")
				httpx.Error(w, http.StatusTooManyRequests, "monthly quota exceeded for tier "+rec.Tier)
				return
			}
		}
		mw := &meteredWriter{ResponseWriter: w, status: http.StatusOK}
		next(mw, r)
		if rec != nil {
			meter.Record(metering.Event{
				Time:     time.Now().UTC(),
				KeyID:    rec.ID,
				FirmID:   rec.FirmID,
				Endpoint: r.URL.Path,
				Method:   r.Method,
				Status:   mw.status,
				Bytes:    mw.bytes,
			})
		}
	}
}
