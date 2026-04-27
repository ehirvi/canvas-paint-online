package main

import (
	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/server"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	applicationContext := application.CreateApplicationContext()
	server.InitializeServer(applicationContext)
}
