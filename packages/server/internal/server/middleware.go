package server

import (
	"net/http"
	"slices"
)

func CorsHandler(w http.ResponseWriter, r *http.Request) {
	allowedOrigins := []string{"https://localhost:5173"}

	origin := r.Header.Get("Origin")

	if slices.Contains(allowedOrigins, origin) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	}

	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
