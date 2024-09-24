-- name: GetAllUsers :many
select * from users
order by id;

-- name: GetUser :one
select * from users
where id = $1 limit 1;

-- name: CreateUser :one
insert into users (
  email, password
) values (
  $1, $2
) returning *;

-- name: UpdateUser :one
update users
  set email = $2, password = $3
where id = $1
returning *;

-- name: DeleteUser :exec
delete from users
where id = $1;
