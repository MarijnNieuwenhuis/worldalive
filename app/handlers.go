package main

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
)

type handlers struct {
	distDir string
}

func (h *handlers) postEvents(w http.ResponseWriter, r *http.Request) {
	var payload json.RawMessage
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	out, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		http.Error(w, "failed to marshal", http.StatusInternalServerError)
		return
	}

	dest := filepath.Join(h.distDir, "billings-montana", "pending-events.json")
	if err := os.WriteFile(dest, out, 0644); err != nil {
		http.Error(w, "failed to write file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"ok":true}`))
}
