-- name: GetAllUsers :many
select * from users
order by id;

-- name: GetUser :one
select * from users
where id = $1 limit 1;

-- name: GetUserByEmail :one
select * from users
where email = $1 limit 1;

-- name: CreateUser :one
insert into users (
  email, password, given_name, family_name
) values (
  $1, $2, $3, $4
) returning *;

-- name: UpdateUser :one
update users
  set email = $2, password = $3, given_name = $4, family_name = $5, updated_at = NOW()
where id = $1
returning *;

-- name: DeleteUser :exec
delete from users
where id = $1;
