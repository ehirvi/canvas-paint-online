package routes

import (
	"fmt"
	"net/http"
	"online-canvas-paint-server/internal/application"
)

var Health = Route{
	Path:   "/health",
	Method: HttpMethod(Get),
	Handler: func(_ *application.Application, w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "ok")
	},
}
