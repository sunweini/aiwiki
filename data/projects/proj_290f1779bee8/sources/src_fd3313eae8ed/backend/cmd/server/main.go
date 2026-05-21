package main

import (
	"fmt"
	"log"

	"yfsc-platform-v2/backend/internal/config"
	"yfsc-platform-v2/backend/internal/database"
	"yfsc-platform-v2/backend/internal/router"
)

func main() {
	// Load configuration
	if err := config.Load(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	log.Printf("Running in %s mode", config.C.App.Env)

	// Connect to MySQL
	db := database.MustConnect()

	// Connect to Redis
	rdb := database.MustConnectRedis()

	// Run database migrations
	database.RunMigrate(db)

	// Setup router
	r := router.Setup(db, rdb)

	// Start server
	addr := fmt.Sprintf(":%d", config.C.App.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
