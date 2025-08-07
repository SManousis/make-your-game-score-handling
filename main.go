package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

type wrapper struct {
	next http.Handler
}

func (w wrapper) ServeHTTP(wr http.ResponseWriter, re *http.Request) {
	// fmt.Println("endpoint hit: ", re.URL.Path)
	w.next.ServeHTTP(wr, re)
}

func main() {

	mux := http.NewServeMux()

	h := http.FileServer(http.Dir("."))

	w := wrapper{}
	w.next = h

	mux.Handle("/", w)

	var finished bool

	func() {
		fmt.Println("running at 8080")
		if err := http.ListenAndServe("localhost:8080", mux); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe() failed: %v", err)
		}
		finished = true
	}()

	for !finished {
		time.Sleep(time.Second)
		fmt.Println("yo")
	}

}
