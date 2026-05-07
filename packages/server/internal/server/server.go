package server

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"runtime"

	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/routes"
	"online-canvas-paint-server/internal/transport"

	"github.com/quic-go/quic-go/http3"
	"github.com/quic-go/webtransport-go"
)

func getTSLCertAndKey() (string, string) {
	_, filename, _, _ := runtime.Caller(0)

	root := filepath.Join(filepath.Dir(filename), "..", "..", "..", "..")

	certPath := filepath.Join(root, "localhost.pem")
	keyPath := filepath.Join(root, "localhost-key.pem")

	return certPath, keyPath
}

func createHttp3Server() (*http3.Server, *http.ServeMux) {
	mux := http.NewServeMux()
	h3 := &http3.Server{Handler: mux, Addr: ":8443", TLSConfig: http3.ConfigureTLSConfig(&tls.Config{})}
	return h3, mux
}

func createWebTransportServer(h3 *http3.Server) *webtransport.Server {
	webtransport.ConfigureHTTP3Server(h3)
	wt := &webtransport.Server{H3: h3, CheckOrigin: func(r *http.Request) bool { return true }}
	return wt
}

func createHttpRoutes(app *application.Application, mux *http.ServeMux) {
	routes := routes.GetRoutes()
	for _, route := range routes {
		pattern := fmt.Sprintf("%s %s", route.Method, route.Path)
		mux.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
			CorsHandler(w, r)
			route.Handler(app, w, r)
		})
	}
}

func createWebTransportRoute(app *application.Application, wt *webtransport.Server, mux *http.ServeMux) {
	pattern := fmt.Sprintf("%s /session/wt", http.MethodConnect)
	mux.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
		transport.UpgradeToWebTransportSession(app, wt, w, r)
	})
}

func serveHttpFallbackServer(h3 *http3.Server, cert string, key string) {
	go func() {
		log.Fatal(http.ListenAndServeTLS(h3.Addr, cert, key, h3.Handler))
	}()
}

func serveWebTransportServer(wt *webtransport.Server, certFile string, keyFile string) {
	log.Fatal(wt.ListenAndServeTLS(certFile, keyFile))
}

func InitializeServer(app *application.Application) {
	cert, key := getTSLCertAndKey()

	h3, mux := createHttp3Server()
	wt := createWebTransportServer(h3)

	createHttpRoutes(app, mux)
	createWebTransportRoute(app, wt, mux)

	fmt.Printf("\nServer running on %s\n\n", h3.Addr)
	serveHttpFallbackServer(h3, cert, key)
	serveWebTransportServer(wt, cert, key)
}
