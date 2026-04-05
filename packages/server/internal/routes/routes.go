package routes

import "net/http"

type HttpMethod string

const (
	Get  HttpMethod = http.MethodGet
	Post HttpMethod = http.MethodPost
)

type Route struct {
	Path    string
	Method  HttpMethod
	Handler func(http.ResponseWriter, *http.Request)
}

var routes = []Route{Health}

func GetRoutes() []Route {
	return routes
}
