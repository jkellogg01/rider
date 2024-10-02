-- name: GetInvitation :one
SELECT * FROM invitation 
WHERE body = $1
GROUP BY id
LIMIT 1;

-- name: CreateInvitation :one
INSERT INTO invitation (
  creator_id, band_id, body, expires_at
) VALUES (
  $1, $2, $3, $4
) RETURNING *;
