package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/jkellogg01/rider/server/database"
	"github.com/jkellogg01/rider/server/jwt"
	"golang.org/x/crypto/bcrypt"
)

func (cfg *config) CreateUser(w http.ResponseWriter, r *http.Request) {
	bodyDecoder := json.NewDecoder(r.Body)
	var body struct {
		Email      string `json:"email"`
		Pass       string `json:"password"`
		GivenName  string `json:"givenName"`
		FamilyName string `json:"familyName"`
	}
	err := bodyDecoder.Decode(&body)
	if err != nil {
		log.Printf("failed to decode request body: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "failed to decode request body")
		return
	}

	passEncrypt, err := bcrypt.GenerateFromPassword([]byte(body.Pass), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("failed to encrypt password: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "failed to encrypt password")
		return
	}

	created, err := cfg.db.CreateAccount(r.Context(), database.CreateAccountParams{
		Email:      body.Email,
		Password:   string(passEncrypt),
		GivenName:  body.GivenName,
		FamilyName: body.FamilyName,
	})
	if err != nil {
		log.Printf("failed to write to database: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "failed to write to database")
		return
	}

	accessToken, err := jwt.GenerateAccessToken(created.ID).SignedString(os.Getenv("JWT_SECRET"))
	if err != nil {
		log.Printf("failed to sign access token: %v", err)
	} else {
		authCookie := http.Cookie{
			Name:        "rider-access",
			Value:       accessToken,
			Path:        "/",
			Quoted:      false,
			Secure:      true,
			HttpOnly:    false,
			SameSite:    http.SameSiteLaxMode,
			Partitioned: true,
		}
		http.SetCookie(w, &authCookie)
	}

	RespondWithJSON(w, http.StatusCreated, map[string]any{
		"id":         created.ID,
		"email":      created.Email,
		"givenName":  created.GivenName,
		"familyName": created.FamilyName,
	})
}

func (cfg *config) LoginUser(w http.ResponseWriter, r *http.Request) {
	bodyDecoder := json.NewDecoder(r.Body)
	var body struct {
		Email string `json:"email"`
		Pass  string `json:"password"`
	}
	err := bodyDecoder.Decode(&body)
	if err != nil {
		log.Printf("failed to decode request body: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "failed to decode request body")
		return
	}

	user, err := cfg.db.GetAccountByEmail(r.Context(), body.Email)
	if errors.Is(err, sql.ErrNoRows) {
		log.Printf("failed to find user: %v", err)
		RespondWithError(w, http.StatusNotFound, "failed to find user")
		return
	} else if err != nil {
		log.Printf("unexpected DB error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "unexpected database error")
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Pass))
	if err != nil {
		log.Printf("failed to authenticate user: %v", err)
		RespondWithError(w, http.StatusUnauthorized, "failed to authenticate user")
		return
	}

	accessToken, err := jwt.GenerateAccessToken(user.ID).SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		log.Printf("failed to sign access token: %v", err)
	} else {
		authCookie := http.Cookie{
			Name:        "rider-access",
			Value:       accessToken,
			Path:        "/",
			Quoted:      false,
			Secure:      true,
			HttpOnly:    false,
			SameSite:    http.SameSiteLaxMode,
			Partitioned: true,
		}
		http.SetCookie(w, &authCookie)
	}

	RespondWithJSON(w, http.StatusOK, map[string]any{
		"id":         user.ID,
		"email":      user.Email,
		"givenName":  user.GivenName,
		"familyName": user.FamilyName,
	})
}

func (cfg *config) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	id, ok := r.Context().Value("current-user").(int32)
	if !ok {
		RespondWithError(w, http.StatusInternalServerError, "invalid or missing user id")
		return
	}

	user, err := cfg.db.GetAccount(r.Context(), id)
	if errors.Is(err, sql.ErrNoRows) {
		RespondWithError(w, http.StatusNotFound, "failed to find user")
		return
	} else if err != nil {
		log.Printf("database error: %v", err)
		RespondWithError(w, http.StatusInternalServerError, "unexpected database error")
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]any{
		"id":         user.ID,
		"email":      user.Email,
		"givenName":  user.GivenName,
		"familyName": user.FamilyName,
	})
}
