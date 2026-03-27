package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestPostEvents_WritesFile(t *testing.T) {
	tmpDir := t.TempDir()
	h := &handlers{distDir: tmpDir}

	body := `{
		"schema_version": 1,
		"target_time": "2026-03-27-1400",
		"events": [{"id":"evt-1","description":"test event","characters":["jolene-voss"],"location":"downtown"}],
		"status": "pending",
		"conflicts": []
	}`

	req := httptest.NewRequest(http.MethodPost, "/events", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.postEvents(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	data, err := os.ReadFile(filepath.Join(tmpDir, "pending-events.json"))
	if err != nil {
		t.Fatalf("pending-events.json not written: %v", err)
	}
	if !strings.Contains(string(data), "evt-1") {
		t.Errorf("expected evt-1 in written file, got: %s", string(data))
	}
}

func TestPostEvents_RejectsBadJSON(t *testing.T) {
	tmpDir := t.TempDir()
	h := &handlers{distDir: tmpDir}

	req := httptest.NewRequest(http.MethodPost, "/events", strings.NewReader("not json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.postEvents(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}
