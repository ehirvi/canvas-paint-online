package main

import (
	"online-canvas-paint-server/internal/server"
	"online-canvas-paint-server/internal/session"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	manager := session.NewManager()
	server.InitializeServer(manager)
}
