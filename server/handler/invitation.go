package handler

import (
	"context"
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

	// TODO: interpret expire as UTC milliseconds instead of seconds from now
	expireString := r.URL.Query().Get("expire")
	var expireTime time.Time
	if expireString != "" {
		expireMs, err := strconv.Atoi(expireString)
		if err != nil {
			expireMs = 60 * 15
		}
		expireTime = time.UnixMilli(int64(expireMs))
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

func (cfg *config) SaveInvitation(w http.ResponseWriter, r *http.Request) {
	inviteString := r.PathValue("invite_id")
	inviteId, err := strconv.Atoi(inviteString)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "failed to parse invitation id")
		return
	}

	err = cfg.db.KeepInvitation(r.Context(), int32(inviteId) /* invitation id */)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "failed to save invitation")
		return
	}

	RespondWithJSON(w, http.StatusOK, "invitation saved!")
}

// not really sure this is the place because it's not an http handler
func (cfg *config) CullInvitations() {
	err := cfg.db.CullInvitations(context.Background(), database.CullInvitationsParams{
		ExpiredCull: "7 Days",
		UnkeptCull:  "30 Minutes",
	})
	if err != nil {
		log.Printf("invitation culling failed: %v", err)
	} else {
		log.Printf("culled invitations")
	}
}
