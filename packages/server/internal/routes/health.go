package routes

import (
	"fmt"
	"net/http"
)

var Health = Route{
	Path:   "/health",
	Method: HttpMethod(Get),
	Handler: func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "ok")
	},
}
