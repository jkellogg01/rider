package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/jkellogg01/rider/server/database"
	"golang.org/x/crypto/bcrypt"
)

func (cfg *config) CreateUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	bodyDecoder := json.NewDecoder(r.Body)
	var body database.User
	err := bodyDecoder.Decode(&body)
	if err != nil {
		log.Printf("failed to decode request body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	passEncrypt, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("failed to encrypt password: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	created, err := cfg.db.CreateUser(ctx, database.CreateUserParams{
		Email:    body.Email,
		Password: string(passEncrypt),
	})
	if err != nil {
		log.Printf("database error: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	respondWithJSON(w, 201, map[string]any{
		"id":    created.ID,
		"email": created.Email,
	})
}
