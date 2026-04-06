package server

import (
	"fmt"
	"log"
	"net/http"
	"online-canvas-paint-server/internal/routes"
	"online-canvas-paint-server/internal/session"
	"online-canvas-paint-server/internal/transport"

	"github.com/quic-go/quic-go/http3"
	"github.com/quic-go/webtransport-go"
)

func createHttp3Server() (*http3.Server, *http.ServeMux) {
	mux := http.NewServeMux()
	server := &http3.Server{Handler: mux, Addr: ":8443"}
	return server, mux
}

func createWebTransportServer(h3Server *http3.Server) *webtransport.Server {
	wtServer := &webtransport.Server{H3: h3Server}
	webtransport.ConfigureHTTP3Server(h3Server)
	return wtServer
}

func createHttpRoutes(manager *session.Manager, mux *http.ServeMux) {
	routes := routes.GetRoutes()
	for _, route := range routes {
		pattern := fmt.Sprintf("%s %s", route.Method, route.Path)
		mux.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
			route.Handler(*manager, w, r)
		})
	}
}

func createWebTransportRoute(wtServer *webtransport.Server, mux *http.ServeMux) {
	pattern := "CONNECT /session/wt"
	mux.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
		transport.UpgradeToWebTransportSession(wtServer, w, r)
	})
}

func serveHttpFallbackServer(h3Server *http3.Server, certFile string, keyFile string) {
	go func() {
		log.Fatal(http.ListenAndServeTLS(h3Server.Addr, certFile, keyFile, h3Server.Handler))
	}()
}

func serveWebTransportServer(server *webtransport.Server, certFile string, keyFile string) {
	log.Fatal(server.ListenAndServeTLS(certFile, keyFile))
}

func InitializeServer(manager *session.Manager) {
	certFile := "localhost.pem"
	keyFile := "localhost-key.pem"

	h3Server, mux := createHttp3Server()
	wtServer := createWebTransportServer(h3Server)

	createHttpRoutes(manager, mux)
	createWebTransportRoute(wtServer, mux)

	fmt.Printf("\nServer running on %s\n\n", h3Server.Addr)
	serveHttpFallbackServer(h3Server, certFile, keyFile)
	serveWebTransportServer(wtServer, certFile, keyFile)
}
