package handlers

import "net/http"

func SetupRoutes() http.Handler {

	mux := http.NewServeMux()

	mux.HandleFunc("/scores", scoresHandler)

	return mux
}
