package routes

import (
	"net/http"
	"canvas-paint-webtransport-server/internal/application"
)

type HttpMethod string

const (
	Get  HttpMethod = http.MethodGet
	Post HttpMethod = http.MethodPost
)

type Route struct {
	Path    string
	Method  HttpMethod
	Handler func(*application.Application, http.ResponseWriter, *http.Request)
}

var routes = []Route{Health, SessionCreate, SessionJoin}

func GetRoutes() []Route {
	return routes
}
