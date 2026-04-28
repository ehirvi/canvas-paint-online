package routes

import (
	"encoding/json"
	"net/http"
)

func SendJsonResponse(w http.ResponseWriter, body any, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(body)
}

func SendErrorResponse(w http.ResponseWriter, errMsg string, statusCode int) {
	http.Error(w, errMsg, statusCode)
}
