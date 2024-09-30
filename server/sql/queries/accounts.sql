-- name: GetAllAccounts :many
select * from account
order by id;

-- name: GetAccount :one
select * from account
where id = $1 limit 1;

-- name: GetAccountByEmail :one
select * from account
where email = $1 limit 1;

-- name: CreateAccount :one
insert into account (
  email, password, given_name, family_name
) values (
  $1, $2, $3, $4
) returning *;

-- name: UpdateAccount :one
update account
  set email = $2, password = $3, given_name = $4, family_name = $5, updated_at = NOW()
where id = $1
returning *;

-- name: DeleteAccount :exec
delete from account
where id = $1;
