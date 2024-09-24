package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type config struct {
	db *sql.DB
}

func NewConfig() *config {
	return &config{}
}

func (cfg *config) WithDB(db *sql.DB) *config {
	cfg.db = db
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
