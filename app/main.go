package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

//go:embed static
var staticFiles embed.FS

func main() {
	distDir := distPath()

	mux := http.NewServeMux()

	// Serve compiled React app from embedded static/
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatal(err)
	}
	mux.Handle("/assets/", http.FileServer(http.FS(staticFS)))
	mux.Handle("/", http.FileServer(http.FS(staticFS)))

	// Serve world JSON from local dist/ at runtime (not embedded — updates without restart)
	mux.Handle("/dist/", http.StripPrefix("/dist/", http.FileServer(http.Dir(distDir))))

	// Event proposal endpoint
	h := &handlers{distDir: distDir}
	mux.HandleFunc("POST /events", h.postEvents)

	log.Println("World running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

// distPath returns the absolute path to dist/, relative to the working directory.
func distPath() string {
	wd, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	return filepath.Join(wd, "dist")
}
