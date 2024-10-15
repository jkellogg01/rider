package main

import (
	"cmp"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jkellogg01/rider/server/handler"
	"github.com/jkellogg01/rider/server/middleware/authentication"
	"github.com/jkellogg01/rider/server/middleware/logging"
	"github.com/pressly/goose"

	_ "github.com/lib/pq"
)

func main() {
	log.SetOutput(os.Stdout)
	db, err := initDB()
	if err != nil {
		log.Fatal(err)
	}

	cfg := handler.NewConfig().WithDB(db)

	router := http.NewServeMux()

	api := http.NewServeMux()
	router.Handle("/api/", http.StripPrefix("/api", api))
	api.HandleFunc("POST /users", cfg.CreateUser)
	api.HandleFunc("POST /login", cfg.LoginUser)

	authed := http.NewServeMux()
	api.Handle("/", authentication.AuthenticateUser(authed))
	authed.HandleFunc("GET /me", cfg.GetCurrentUser)
	authed.HandleFunc("GET /bands", cfg.GetUserBands)
	authed.HandleFunc("GET /bands/{band_id}", cfg.GetBand)
	authed.HandleFunc("POST /bands", cfg.CreateBand)
	authed.HandleFunc("GET /bands/join/{band_id}", cfg.CreateInvitation)
	authed.HandleFunc("POST /bands/join/{invite_id}", cfg.SaveInvitation)
	authed.HandleFunc("POST /bands/join", cfg.RedeemInvitation)

	dist := http.FileServer(http.Dir("dist"))
	router.Handle("/", dist)

	l := logging.New()
	server := http.Server{
		Addr:    fmt.Sprintf("0.0.0.0:%s", cmp.Or(os.Getenv("PORT"), "8080")),
		Handler: l.Logging(router),
	}

	daily := time.NewTicker(time.Second * 60 * 60 * 24)
	go func() {
		for range daily.C {
			cfg.CullInvitations()
		}
	}()

	log.Printf("starting server at %s", server.Addr)
	err = server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}

func initDB() (*sql.DB, error) {
	log.SetOutput(os.Stdout)
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
	return db, err
}
