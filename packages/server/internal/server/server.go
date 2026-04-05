package server

import (
	"fmt"
	"log"
	"net/http"
	"online-canvas-paint-server/internal/routes"

	"github.com/quic-go/quic-go/http3"
)

func createHttp3Server() (*http3.Server, *http.ServeMux) {
	mux := http.NewServeMux()
	server := &http3.Server{Handler: mux, Addr: ":8443"}
	return server, mux
}

func createRoutes(mux *http.ServeMux) {
	routes := routes.GetRoutes()
	for _, route := range routes {
		pattern := fmt.Sprintf("%s %s", route.Method, route.Path)
		mux.HandleFunc(pattern, route.Handler)
	}
}

func listenHttpFallbackServer(h3Server *http3.Server, certFile string, keyFile string) {
	go func() {
		log.Fatal(http.ListenAndServeTLS(h3Server.Addr, certFile, keyFile, h3Server.Handler))
	}()
}

func InitializeServer() {
	certFile := "localhost.pem"
	keyFile := "localhost-key.pem"

	h3Server, mux := createHttp3Server()
	createRoutes(mux)

	fmt.Printf("Server running on %s", h3Server.Addr)
	listenHttpFallbackServer(h3Server, certFile, keyFile)
}
