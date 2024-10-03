package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/jkellogg01/rider/server/database"
)

func (cfg *config) GetBand(w http.ResponseWriter, r *http.Request) {
	id, ok := r.Context().Value("current-user").(int)
	if !ok {
		RespondWithError(w, http.StatusBadRequest, "invalid or missing user id")
		return
	}

	bandIdString := r.PathValue("band_id")
	bandId, err := strconv.Atoi(bandIdString)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "could not parse band id")
		return
	}

	band, err := cfg.db.GetBand(r.Context(), database.GetBandParams{
		AccountID: int32(id),
		ID:        int32(bandId),
	})
	if errors.Is(err, sql.ErrNoRows) {
		RespondWithError(w, http.StatusNotFound, "no matching band")
		return
	} else if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "unexpected database error")
		return
	}

	RespondWithJSON(w, http.StatusOK, band)
}

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

	ab, err := cfg.db.CreateAccountBand(r.Context(), database.CreateAccountBandParams{
		AccountID:      int32(id),
		BandID:         band.ID,
		AccountIsAdmin: true,
	})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "failed to write to database")
	}

	RespondWithJSON(w, http.StatusCreated, map[string]any{
		"id":            band.ID,
		"name":          band.Name,
		"created_at":    band.CreatedAt,
		"updated_at":    band.UpdatedAt,
		"user_is_admin": ab.AccountIsAdmin,
	})
}

func (cfg *config) CreateInvitation(w http.ResponseWriter, r *http.Request) {
	id, ok := r.Context().Value("current-user").(int)
	if !ok {
		RespondWithError(w, http.StatusBadRequest, "invalid or missing user id")
		return
	}

	bandIDString := r.PathValue("band_id")
	bandID, err := strconv.Atoi(bandIDString)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "invalid band id")
		return
	}

	expireString := r.URL.Query().Get("expire")
	var expireTime time.Time
	if expireString != "" {
		expireSeconds, err := strconv.Atoi(expireString)
		if err != nil {
			expireSeconds = 60 * 15
		}
		expireTime = time.Now().Add(time.Second * time.Duration(expireSeconds))
	}

	var invitation database.Invitation
	for i := 0; i < 5; i++ {
		// HACK: I would do this in a smarter way if I was more worried about invitation collisions
		invitation, err = cfg.db.CreateInvitation(r.Context(), database.CreateInvitationParams{
			CreatorID: int32(id),
			BandID:    int32(bandID),
			Body:      generateInvitationBody(10),
			ExpiresAt: expireTime,
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

func (cfg *config) RedeemInvitation(w http.ResponseWriter, r *http.Request) {
	id, ok := r.Context().Value("current-user").(int)
	if !ok {
		RespondWithError(w, http.StatusBadRequest, "missing or invalid user id")
		return
	}

	var body struct {
		Code string `json:"code"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "failed to decode request body")
		return
	}

	invitation, err := cfg.db.GetInvitation(r.Context(), body.Code)
	if errors.Is(err, sql.ErrNoRows) {
		RespondWithError(w, http.StatusNotFound, "could not find an invitation related to this code")
		return
	} else if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "unexpected database error")
		return
	} else if invitation.ExpiresAt.After(time.Now()) {
		RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("this invitation code expired at %v", invitation.ExpiresAt))
		return
	}

	accountBand, err := cfg.db.CreateAccountBand(r.Context(), database.CreateAccountBandParams{
		AccountID: int32(id),
		BandID:    invitation.BandID,
		// TODO: store this with the rest of the invitation data
		AccountIsAdmin: false,
	})
	if errors.Is(err, sql.ErrNoRows) {
		// TODO: I'm not sure if this will actually come up
		// need to establish the foundation to make these kinds of checks
		RespondWithError(w, http.StatusNotFound, "the band this invitation refers to does not exist")
		return
	} else if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "unexpected database error")
		return
	}

	RespondWithJSON(w, http.StatusCreated, accountBand)
}
