package authentication

import (
	"context"
	"net/http"
	"strconv"

	"github.com/jkellogg01/rider/server/handler"
	"github.com/jkellogg01/rider/server/jwt"
)

func AuthenticateUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accessCookie, err := r.Cookie("rider-access")
		if err != nil {
			handler.RespondWithError(w, http.StatusBadRequest, "no access cookie provided")
			return
		}

		accessToken, err := jwt.ValidateAccessToken(accessCookie.Value)
		if err != nil {
			handler.RespondWithError(w, http.StatusBadRequest, "failed to validate access token")
			return
		}

		idString, err := accessToken.Claims.GetSubject()
		if err != nil {
			handler.RespondWithError(w, http.StatusInternalServerError, "failed to fetch token subject")
			return
		}

		id, err := strconv.Atoi(idString)
		if err != nil {
			handler.RespondWithError(w, http.StatusInternalServerError, "failed to convert id to string")
			return
		}

		ctx := context.WithValue(r.Context(), "current-user", id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
