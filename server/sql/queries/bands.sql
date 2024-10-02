-- name: GetAccountBands :many
select ab.account_id, ab.account_is_admin, ab.created_at as joined_at, ab.updated_at as join_updated_at, b.id, b.name, b.created_at, b.updated_at from account_band ab
join band b
on account_id = $1 and band_id = band.id;

-- name: CreateBand :one
insert into band (name) values ($1) returning *;

-- name: CreateAccountBand :one
insert into account_band (
  account_id,
  band_id,
  account_is_admin
) values ($1, $2, $3) returning *;
