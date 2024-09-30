-- name: GetAccountBands :many
select * from band where exists (
  select * from account_band where account_id = $1 and band_id = band.id
);

-- name: CreateBand :exec
insert into band (name) values ($1);

-- name: CreateAccountBand :exec
insert into account_band (
  account_id,
  band_id,
  account_is_admin
) values ($1, $2, $3);
