package main

import (
	"cmp"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jkellogg01/rider/server/handler"
	"github.com/jkellogg01/rider/server/middleware"
	"github.com/pressly/goose"

	_ "github.com/lib/pq"
)

func main() {
	db, err := initDB()
	if err != nil {
		log.Fatal(err)
	}

	cfg := handler.NewConfig().WithDB(db)

	router := http.NewServeMux()

	api := http.NewServeMux()
	router.Handle("/api/", http.StripPrefix("/api", api))
	api.HandleFunc("POST /users", cfg.CreateUser)
	api.HandleFunc("POST /login", cfg.AuthenticateUser)
	api.HandleFunc("GET /me", cfg.GetCurrentUser)

	dist := http.FileServer(http.Dir("dist"))
	router.Handle("/", dist)

	server := http.Server{
		Addr:    fmt.Sprintf("0.0.0.0:%s", cmp.Or(os.Getenv("PORT"), "8080")),
		Handler: middleware.Logging(router),
	}

	log.Printf("starting server at %s", server.Addr)
	err = server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}

func initDB() (*sql.DB, error) {
	dbURL := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, err
	}
	err = goose.SetDialect("postgres")
	if err != nil {
		return nil, err
	}
	err = goose.Up(db, "sql/schema")
	if err != nil {
		return nil, err
	}
	err = goose.Status(db, "sql/schema")
	return db, err
}
