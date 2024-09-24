package main

import (
	"cmp"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jkellogg01/rider/server/middleware"
)

func main() {
	router := http.NewServeMux()

	dist := http.FileServer(http.Dir("dist"))
	router.Handle("GET /", dist)

	server := http.Server{
		Addr:    fmt.Sprintf("0.0.0.0:%s", cmp.Or(os.Getenv("PORT"), "8080")),
		Handler: middleware.Logging(router),
	}

	err := server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}
