package main

import (
	"canvas-paint-webtransport-server/internal/application"
	"canvas-paint-webtransport-server/internal/server"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	app := application.CreateApplication()
	server.InitializeServer(app)
}
