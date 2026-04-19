package routes

import (
	"net/http"
	"online-canvas-paint-server/internal/context"
)

type HttpMethod string

const (
	Get  HttpMethod = http.MethodGet
	Post HttpMethod = http.MethodPost
)

type Route struct {
	Path    string
	Method  HttpMethod
	Handler func(*context.ApplicationContext, http.ResponseWriter, *http.Request)
}

var routes = []Route{Health, SessionCreate, SessionJoin}

func GetRoutes() []Route {
	return routes
}
