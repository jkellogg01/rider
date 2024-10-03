-- name: GetAccountBands :many
select 
  ab.account_id, 
  ab.account_is_admin,
  ab.created_at as joined_at,
  ab.updated_at as join_updated_at,
  b.id,
  b.name,
  b.created_at,
  b.updated_at 
from account_band ab
join band b
on ab.account_id = $1 and ab.band_id = b.id;

-- name: GetBand :one
select * from band where exists (
  select * from account_band where account_id = $1 and band_id = band.id
) and band.id = $2 
group by band.id limit 1;

-- name: CreateBand :one
insert into band (name) values ($1) returning *;

-- name: CreateAccountBand :one
insert into account_band (
  account_id,
  band_id,
  account_is_admin
) values ($1, $2, $3) returning *;
