package server

import (
	"crypto/tls"
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
	server := &http3.Server{Handler: mux, Addr: ":8443", TLSConfig: http3.ConfigureTLSConfig(&tls.Config{})}
	return server, mux
}

func createWebTransportServer(h3Server *http3.Server) *webtransport.Server {
	webtransport.ConfigureHTTP3Server(h3Server)
	wtServer := &webtransport.Server{H3: h3Server, CheckOrigin: func(r *http.Request) bool { return true }}
	return wtServer
}

func createHttpRoutes(manager *session.Manager, mux *http.ServeMux) {
	routes := routes.GetRoutes()
	for _, route := range routes {
		pattern := fmt.Sprintf("%s %s", route.Method, route.Path)
		mux.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
			CorsHandler(w, r)
			route.Handler(*manager, w, r)
		})
	}
}

func createWebTransportRoute(manager *session.Manager, wtServer *webtransport.Server, mux *http.ServeMux) {
	pattern := fmt.Sprintf("%s /session/wt", http.MethodConnect)
	mux.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
		transport.UpgradeToWebTransportSession(manager, wtServer, w, r)
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
	createWebTransportRoute(manager, wtServer, mux)

	fmt.Printf("\nServer running on %s\n\n", h3Server.Addr)
	serveHttpFallbackServer(h3Server, certFile, keyFile)
	serveWebTransportServer(wtServer, certFile, keyFile)
}
