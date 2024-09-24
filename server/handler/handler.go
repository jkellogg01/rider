package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/jkellogg01/rider/server/database"
)

type config struct {
	db *database.Queries
}

func NewConfig() *config {
	return &config{}
}

func (cfg *config) WithDB(db *sql.DB) *config {
	cfg.db = database.New(db)
	return cfg
}

func respondWithJSON(w http.ResponseWriter, status int, data any) {
	body, err := json.Marshal(data)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(status)
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}
