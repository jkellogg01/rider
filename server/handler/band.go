package handler

import (
	"cmp"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"math"
	"math/rand"
	"net/http"
	"time"

	"github.com/jkellogg01/rider/server/database"
)

func (cfg *config) GetUserBands(w http.ResponseWriter, r *http.Request) {
	id, ok := r.Context().Value("current-user").(int)
	if !ok {
		RespondWithError(w, http.StatusBadRequest, "invalid or missing user id")
		return
	}

	bands, err := cfg.db.GetAccountBands(r.Context(), int32(id))
	if errors.Is(err, sql.ErrNoRows) {
		// NOTE: it doesn't look like this path actually gets hit when there are no bands for the account
		RespondWithError(w, http.StatusNotFound, "no bands for this account")
		return
	} else if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "unexpected database error")
		return
	}

	RespondWithJSON(w, http.StatusOK, bands)
}

func (cfg *config) CreateBand(w http.ResponseWriter, r *http.Request) {
	id, ok := r.Context().Value("current-user").(int)
	if !ok {
		RespondWithError(w, http.StatusBadRequest, "invalid or missing user id")
		return
	}

	var body struct {
		Name string `json:"name"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "failed to decode request body")
		return
	}

	band, err := cfg.db.CreateBand(r.Context(), body.Name)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "failed to write database")
		return
	}

	_, err = cfg.db.CreateAccountBand(r.Context(), database.CreateAccountBandParams{
		AccountID:      int32(id),
		BandID:         band.ID,
		AccountIsAdmin: true,
	})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "failed to write to database")
	}

	RespondWithJSON(w, http.StatusCreated, band)
}

func (cfg *config) CreateInvitation(w http.ResponseWriter, r *http.Request) {
	id, ok := r.Context().Value("current-user").(int)
	if !ok {
		RespondWithError(w, http.StatusBadRequest, "invalid or missing user id")
		return
	}

	var body struct {
		Band      int32     `json:"band_id,omitempty"`
		ExpiresAt time.Time `json:"expires_at,omitempty"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "failed to decode request body")
		return
	} else if body.Band == 0 {
		RespondWithError(w, http.StatusBadRequest, "request must contain band id")
		return
	}

	var invitation database.Invitation
	for i := 0; i < 5; i++ {
		// HACK: I would do this in a smarter way if I was more worried about invitation collisions
		invitation, err = cfg.db.CreateInvitation(r.Context(), database.CreateInvitationParams{
			CreatorID: int32(id),
			BandID:    body.Band,
			Body:      generateInvitationBody(10),
			ExpiresAt: cmp.Or(body.ExpiresAt, time.Now().Add(time.Second*60*15)),
		})
		if err == nil {
			RespondWithJSON(w, http.StatusCreated, invitation)
			return
		}
		retryTime := time.Second * time.Duration(math.Pow(2.0, float64(i)))
		log.Printf("encountered error on attempt %d: %v", i, err)
		log.Println("if this is not a uniqueness error, we have a problem")
		log.Printf("retrying in %v...", retryTime)
		time.Sleep(retryTime)
	}
	RespondWithError(w, http.StatusInternalServerError, "failed to generate an invitation. please try again later")
}

func generateInvitationBody(length int) string {
	buf := make([]byte, 0, length)
	for range length {
		char := 'A' + byte(rand.Intn(26))
		buf = append(buf, char)
	}
	return string(buf)
}
