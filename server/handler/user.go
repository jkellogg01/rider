package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jkellogg01/rider/server/database"
	"golang.org/x/crypto/bcrypt"
)

func (cfg *config) CreateUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
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
		respondWithError(w, http.StatusInternalServerError, "failed to decode request body")
		return
	}

	passEncrypt, err := bcrypt.GenerateFromPassword([]byte(body.Pass), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("failed to encrypt password: %v", err)
		respondWithError(w, http.StatusInternalServerError, "failed to encrypt password")
		return
	}

	created, err := cfg.db.CreateAccount(ctx, database.CreateAccountParams{
		Email:      body.Email,
		Password:   string(passEncrypt),
		GivenName:  body.GivenName,
		FamilyName: body.FamilyName,
	})
	if err != nil {
		log.Printf("failed to write to database: %v", err)
		respondWithError(w, http.StatusInternalServerError, "failed to write to database")
		return
	}

	accessToken, err := generateAccessToken(created.ID).SignedString(os.Getenv("JWT_SECRET"))
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

	respondWithJSON(w, http.StatusCreated, map[string]any{
		"id":         created.ID,
		"email":      created.Email,
		"givenName":  created.GivenName,
		"familyName": created.FamilyName,
	})
}

func (cfg *config) LoginUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	bodyDecoder := json.NewDecoder(r.Body)
	var body struct {
		Email string `json:"email"`
		Pass  string `json:"password"`
	}
	err := bodyDecoder.Decode(&body)
	if err != nil {
		log.Printf("failed to decode request body: %v", err)
		respondWithError(w, http.StatusInternalServerError, "failed to decode request body")
		return
	}

	user, err := cfg.db.GetAccountByEmail(ctx, body.Email)
	if errors.Is(err, sql.ErrNoRows) {
		log.Printf("failed to find user: %v", err)
		respondWithError(w, http.StatusNotFound, "failed to find user")
		return
	} else if err != nil {
		log.Printf("unexpected DB error: %v", err)
		respondWithError(w, http.StatusInternalServerError, "unexpected database error")
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Pass))
	if err != nil {
		log.Printf("failed to authenticate user: %v", err)
		respondWithError(w, http.StatusUnauthorized, "failed to authenticate user")
		return
	}

	accessToken, err := generateAccessToken(user.ID).SignedString([]byte(os.Getenv("JWT_SECRET")))
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

	respondWithJSON(w, http.StatusOK, map[string]any{
		"id":         user.ID,
		"email":      user.Email,
		"givenName":  user.GivenName,
		"familyName": user.FamilyName,
	})
}

func (cfg *config) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	accessCookie, err := r.Cookie("rider-access")
	if err != nil {
		// TODO: when we have refresh tokens this will mean we check that here
		log.Printf("failed to fetch access token: %v", err)
		respondWithError(w, http.StatusUnauthorized, "failed to fetch access token")
		return
	}
	accessToken, err := validateAccessToken(accessCookie.Value)
	if err != nil {
		log.Printf("failed to validate access token: %v", err)
		respondWithError(w, http.StatusUnauthorized, "failed to validate access token")
		return
	}
	subject, err := accessToken.Claims.GetSubject()
	if err != nil {
		log.Printf("failed to fetch subject from access token: %v", err)
		respondWithError(w, http.StatusInternalServerError, "failed to fetch access token subject")
		return
	}
	id, err := strconv.Atoi(subject)
	if err != nil {
		log.Printf("failed to parse id: %v", err)
		respondWithError(w, http.StatusInternalServerError, "failed to parse user id")
		return
	}
	user, err := cfg.db.GetAccount(ctx, int32(id))
	if errors.Is(err, sql.ErrNoRows) {
		respondWithError(w, http.StatusNotFound, "failed to find user")
		return
	} else if err != nil {
		log.Printf("database error: %v", err)
		respondWithError(w, http.StatusInternalServerError, "unexpected database error")
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]any{
		"id":         user.ID,
		"email":      user.Email,
		"givenName":  user.GivenName,
		"familyName": user.FamilyName,
	})
}

var (
	ErrIssuerInvalid = errors.New("this is not a rider access token")
)

func generateAccessToken(id int32) *jwt.Token {
	// TODO: shorten this time once refresh tokens are set up
	expireDuration := 24 * time.Hour
	nowUTC := time.Now().UTC()
	issueTimestamp := jwt.NewNumericDate(nowUTC)
	expireTimestamp := jwt.NewNumericDate(nowUTC.Add(expireDuration))
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Issuer:    "rider-access",
		IssuedAt:  issueTimestamp,
		ExpiresAt: expireTimestamp,
		Subject:   strconv.Itoa(int(id)),
	})
	return token
}

func validateAccessToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return nil, err
	}

	i, err := token.Claims.GetIssuer()
	if err != nil {
		return nil, err
	} else if i != "rider-access" {
		return nil, ErrIssuerInvalid
	}
	return token, nil
}
