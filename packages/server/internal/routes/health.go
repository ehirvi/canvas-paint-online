package routes

import (
	"fmt"
	"net/http"
	"canvas-paint-webtransport-server/internal/application"
)

var Health = Route{
	Path:   "/health",
	Method: HttpMethod(Get),
	Handler: func(_ *application.Application, w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "ok")
	},
}
