package routes

import (
	"fmt"
	"net/http"
	"online-canvas-paint-server/internal/session"
)

var Health = Route{
	Path:   "/health",
	Method: HttpMethod(Get),
	Handler: func(_ session.Manager, w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "ok")
	},
}
