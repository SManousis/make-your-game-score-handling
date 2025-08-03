package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"score-api/internal/scores"
	"strconv"
)

func scoresHandler(w http.ResponseWriter, r *http.Request) {

	// This sets the CORS headers for every response from this handler.
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// The browser sends a "preflight" OPTIONS request to check if a POST is allowed.
	// Respond with 200 without processing further
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case http.MethodGet:
		handleGetScores(w, r)
	case http.MethodPost:
		handleSubmitScore(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}

}

func handleGetScores(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	if pageStr == "" {
		pageStr = "1" //default to 1 if not specified
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1 //default to 1 if value is invalid
	}

	paginatedScores, err := scores.RetrieveScores(page)
	if err != nil {
		http.Error(w, "Failed to retrieve scores", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(paginatedScores)
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

	playerStats, err := scores.SaveScore(newScore)
	if err != nil {
		fmt.Printf("Error saving score: %v\n", err)
		http.Error(w, "Failed to save score", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(playerStats)

}
