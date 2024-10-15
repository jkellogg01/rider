package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

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
