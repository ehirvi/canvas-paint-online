package routes

import (
	"fmt"
	"net/http"
	"online-canvas-paint-server/internal/context"
)

var Health = Route{
	Path:   "/health",
	Method: HttpMethod(Get),
	Handler: func(_ *context.ApplicationContext, w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "ok")
	},
}
