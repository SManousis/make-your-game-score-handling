package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"snake/make-your-game/score-api/internal/scores"
)

func scoresHandler(w http.ResponseWriter, r *http.Request) {

	// This sets the CORS headers for every response from this handler.
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:8080")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// The browser sends a "preflight" OPTIONS request to check if a POST is allowed.
	// Respond with 200 without processing further
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method == http.MethodGet {
		handleGetScores(w, r)
	} else if r.Method == http.MethodPost {
		handleSubmitScore(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleGetScores(w http.ResponseWriter, r *http.Request) {
	//sends scores sorted and paginated
}

func handleSubmitScore(w http.ResponseWriter, r *http.Request) {
	var newScore scores.Score

	err := json.NewDecoder(r.Body).Decode(&newScore)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if newScore.Name == "" {
		http.Error(w, "Player name cannot be empty", http.StatusBadRequest)
		return
	}

	err = scores.SaveScore(newScore)
	if err != nil {
		fmt.Printf("Error saving score: %v\n", err)
		http.Error(w, "Failed to save score", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "Score submitted successfully!")
}
