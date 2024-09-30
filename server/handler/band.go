package handler

import (
	"database/sql"
	"errors"
	"net/http"
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

	RespondWithJSON(w, http.StatusOK, map[string]any{
		"bands": bands,
	})
}
