package middleware

import (
	"log"
	"net/http"
	"time"
)

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

// Logging emits a structured line per request. In production this is shipped
// to OpenObserve; here it goes to stdout in a parseable format.
func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: 200}
		next.ServeHTTP(rec, r)
		log.Printf("level=info method=%s path=%s status=%d dur_ms=%.2f",
			r.Method, r.URL.Path, rec.status, float64(time.Since(start).Microseconds())/1000)
	})
}
