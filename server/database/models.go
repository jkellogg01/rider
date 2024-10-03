// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package database

import (
	"time"
)

type Account struct {
	ID         int32     `json:"id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	GivenName  string    `json:"given_name"`
	FamilyName string    `json:"family_name"`
	Email      string    `json:"email"`
	Password   string    `json:"password"`
}

type AccountBand struct {
	ID             int32     `json:"id"`
	AccountID      int32     `json:"account_id"`
	BandID         int32     `json:"band_id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	AccountIsAdmin bool      `json:"account_is_admin"`
}

type Band struct {
	ID        int32     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Name      string    `json:"name"`
}

type Invitation struct {
	ID        int32     `json:"id"`
	Body      string    `json:"body"`
	CreatorID int32     `json:"creator_id"`
	BandID    int32     `json:"band_id"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}
