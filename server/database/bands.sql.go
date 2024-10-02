// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: bands.sql

package database

import (
	"context"
	"time"
)

const createAccountBand = `-- name: CreateAccountBand :one
insert into account_band (
  account_id,
  band_id,
  account_is_admin
) values ($1, $2, $3) returning id, account_id, band_id, created_at, updated_at, account_is_admin
`

type CreateAccountBandParams struct {
	AccountID      int32 `json:"account_id"`
	BandID         int32 `json:"band_id"`
	AccountIsAdmin bool  `json:"account_is_admin"`
}

func (q *Queries) CreateAccountBand(ctx context.Context, arg CreateAccountBandParams) (AccountBand, error) {
	row := q.db.QueryRowContext(ctx, createAccountBand, arg.AccountID, arg.BandID, arg.AccountIsAdmin)
	var i AccountBand
	err := row.Scan(
		&i.ID,
		&i.AccountID,
		&i.BandID,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.AccountIsAdmin,
	)
	return i, err
}

const createBand = `-- name: CreateBand :one
insert into band (name) values ($1) returning id, created_at, updated_at, name
`

func (q *Queries) CreateBand(ctx context.Context, name string) (Band, error) {
	row := q.db.QueryRowContext(ctx, createBand, name)
	var i Band
	err := row.Scan(
		&i.ID,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.Name,
	)
	return i, err
}

const getAccountBands = `-- name: GetAccountBands :many
select ab.account_id, ab.account_is_admin, ab.created_at as joined_at, ab.updated_at as join_updated_at, b.id, b.name, b.created_at, b.updated_at from account_band ab
join band b
on ab.account_id = $1 and ab.band_id = b.id
`

type GetAccountBandsRow struct {
	AccountID      int32     `json:"account_id"`
	AccountIsAdmin bool      `json:"account_is_admin"`
	JoinedAt       time.Time `json:"joined_at"`
	JoinUpdatedAt  time.Time `json:"join_updated_at"`
	ID             int32     `json:"id"`
	Name           string    `json:"name"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (q *Queries) GetAccountBands(ctx context.Context, accountID int32) ([]GetAccountBandsRow, error) {
	rows, err := q.db.QueryContext(ctx, getAccountBands, accountID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetAccountBandsRow
	for rows.Next() {
		var i GetAccountBandsRow
		if err := rows.Scan(
			&i.AccountID,
			&i.AccountIsAdmin,
			&i.JoinedAt,
			&i.JoinUpdatedAt,
			&i.ID,
			&i.Name,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
