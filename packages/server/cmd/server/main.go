package main

import (
	"online-canvas-paint-server/internal/context"
	"online-canvas-paint-server/internal/server"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	applicationContext := context.CreateApplicationContext()
	server.InitializeServer(applicationContext)
}
