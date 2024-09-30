package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/jkellogg01/rider/server/database"
)

func (cfg *config) GetUserBands(w http.ResponseWriter, r *http.Request) {
	id, ok := r.Context().Value("current-user").(int32)
	if !ok {
		RespondWithError(w, http.StatusBadRequest, "invalid or missing user id")
		return
	}

	bands, err := cfg.db.GetAccountBands(r.Context(), id)
	if errors.Is(err, sql.ErrNoRows) {
		RespondWithError(w, http.StatusNotFound, "no bands for this account")
		return
	} else if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "unexpected database error")
		return
	}

	RespondWithJSON(w, http.StatusOK, bands)
}

func (cfg *config) CreateBand(w http.ResponseWriter, r *http.Request) {
	id, ok := r.Context().Value("current-user").(int32)
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
		AccountID:      id,
		BandID:         band.ID,
		AccountIsAdmin: true,
	})
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "failed to write to database")
	}

	RespondWithJSON(w, http.StatusCreated, band)
}
