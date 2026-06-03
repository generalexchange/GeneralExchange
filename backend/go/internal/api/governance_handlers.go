package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/general-exchange/backend/internal/httpx"
	"github.com/general-exchange/backend/internal/keys"
	"github.com/general-exchange/backend/internal/metering"
	"github.com/general-exchange/backend/internal/middleware"
)

// keyStore and usageMeter are shared with the auth/metering middleware. They
// are assigned once in NewRouter.
var (
	keyStore   *keys.Store
	usageMeter *metering.Meter
)

// firmID derives the owning firm from the authenticated user. In this model a
// user owns one firm workspace; the user id doubles as the firm id.
func firmID(r *http.Request) string { return middleware.UserID(r) }

// POST /v1/keys  (auth) — issue a new API key for the firm. The raw key is
// returned exactly once.
func handleCreateKey(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Label string `json:"label"`
		Tier  string `json:"tier"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if body.Tier == "" {
		body.Tier = "free"
	}
	rec, raw, err := keyStore.Create(firmID(r), body.Label, body.Tier)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	tier := keys.TierFor(rec.Tier)
	httpx.OK(w, map[string]any{
		"id":            rec.ID,
		"key":           raw, // shown once — store it securely
		"prefix":        rec.Prefix,
		"label":         rec.Label,
		"tier":          rec.Tier,
		"rps":           tier.RPS,
		"monthly_quota": tier.MonthlyQuota,
		"created":       rec.Created,
	}, time.Now().UTC(), "keystore")
}

// GET /v1/keys  (auth) — list the firm's keys (no secrets).
func handleListKeys(w http.ResponseWriter, r *http.Request) {
	httpx.OK(w, map[string]any{"keys": keyStore.List(firmID(r)), "tiers": keys.Tiers}, time.Now().UTC(), "keystore")
}

// DELETE /v1/keys/{id}  (auth) — revoke a key the firm owns.
func handleRevokeKey(w http.ResponseWriter, r *http.Request) {
	if !keyStore.Revoke(r.PathValue("id"), firmID(r)) {
		httpx.Error(w, http.StatusNotFound, "key not found")
		return
	}
	httpx.OK(w, map[string]any{"id": r.PathValue("id"), "revoked": true}, time.Now().UTC(), "keystore")
}

// GET /v1/usage  (auth) — current-month metering for the firm, per key, with
// tier quotas so the client can render utilization + projected billing.
func handleUsage(w http.ResponseWriter, r *http.Request) {
	fid := firmID(r)
	tierByID := map[string]string{}
	for _, rec := range keyStore.List(fid) {
		tierByID[rec.ID] = rec.Tier
	}
	month, perKey := usageMeter.FirmSnapshot(fid)
	var totalReq, totalBytes int64
	rows := make([]map[string]any, 0, len(perKey))
	for _, u := range perKey {
		totalReq += u.Requests
		totalBytes += u.Bytes
		tier := keys.TierFor(tierByID[u.KeyID])
		rows = append(rows, map[string]any{
			"key_id":      u.KeyID,
			"tier":        tier.Name,
			"requests":    u.Requests,
			"bytes":       u.Bytes,
			"by_endpoint": u.ByEndpoint,
			"quota":       tier.MonthlyQuota,
		})
	}
	httpx.OK(w, map[string]any{
		"month":          month,
		"total_requests": totalReq,
		"total_bytes":    totalBytes,
		"keys":           rows,
	}, time.Now().UTC(), "metering")
}
