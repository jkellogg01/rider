package handler

import (
	"context"
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
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	passEncrypt, err := bcrypt.GenerateFromPassword([]byte(body.Pass), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("failed to encrypt password: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	created, err := cfg.db.CreateUser(ctx, database.CreateUserParams{
		Email:      body.Email,
		Password:   string(passEncrypt),
		GivenName:  body.GivenName,
		FamilyName: body.FamilyName,
	})
	if err != nil {
		log.Printf("database error: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]any{
		"id":    created.ID,
		"email": created.Email,
	})
}

func (cfg *config) AuthenticateUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	bodyDecoder := json.NewDecoder(r.Body)
	var body struct {
		Email string `json:"email"`
		Pass  string `json:"password"`
	}
	err := bodyDecoder.Decode(&body)
	if err != nil {
		log.Printf("failed to decode request body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user, err := cfg.db.GetUserByEmail(ctx, body.Email)
	if err != nil {
		log.Printf("failed to find user: %v", err)
		// NOTE: I feel like a 404 would make sense here but auth errors should
		// maybe be more vague so we send 400 instead
		w.WriteHeader(http.StatusForbidden)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Pass))
	if err != nil {
		log.Printf("failed to authenticate user: %v", err)
		w.WriteHeader(http.StatusForbidden)
		return
	}

	accessToken, err := generateAccessToken(user.ID).SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		log.Printf("failed to sign access token: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	authCookie := http.Cookie{
		Name:        "rider-access",
		Value:       accessToken,
		Quoted:      false,
		Secure:      true,
		HttpOnly:    true,
		SameSite:    http.SameSiteLaxMode,
		Partitioned: true,
	}
	http.SetCookie(w, &authCookie)

	respondWithJSON(w, http.StatusCreated, map[string]any{
		"id":    user.ID,
		"email": user.Email,
	})
}

func (cfg *config) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	accessCookie, err := r.Cookie("rider-access")
	if err != nil {
		// TODO: when we have refresh tokens this will mean we check that here
		log.Printf("failed to fetch access token: %v", err)
		w.WriteHeader(http.StatusForbidden)
		return
	}
	accessToken, err := validateAccessToken(accessCookie.Value)
	if err != nil {
		log.Printf("failed to validate access token: %v", err)
		w.WriteHeader(http.StatusForbidden)
		return
	}
	subject, err := accessToken.Claims.GetSubject()
	if err != nil {
		log.Printf("failed to fetch subject from access token: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	id, err := strconv.Atoi(subject)
	if err != nil {
		log.Printf("failed to parse id: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user, err := cfg.db.GetUser(ctx, int32(id))
	if err != nil {
		log.Printf("database error: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]any{
		"id":    user.ID,
		"email": user.Email,
	})
}

var (
	ErrIssuerInvalid = errors.New("this is not a chirpy access token")
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
