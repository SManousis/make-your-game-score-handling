package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"score-api/internal/handlers"
	"syscall"
	"time"
)

func main() {

	srv := &http.Server{
		Addr:    ":8000",
		Handler: handlers.SetupRoutes(),
	}

	// Start the server in a separate routine
	go func() {
		log.Printf("INFO\tServer starting on port %s... (\033[94mhttps://localhost:%s\033[0m)", srv.Addr, srv.Addr)

		err := srv.ListenAndServe()
		if !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("ERROR\tHTTP server error: %v", err)
		}
		log.Println("INFO\tStopped serving new connections")
	}()

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	shutdownCtx, shutdownRelease := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownRelease()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		srv.Close()
		log.Fatalf("ERROR\tHTTP shutdown error: %v", err)
	}
	log.Println("INFO\tGraceful shutdown complete.")
}
