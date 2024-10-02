-- name: GetInvitation :one
SELECT * FROM invitation 
WHERE body = $1
GROUP BY id
LIMIT 1;
