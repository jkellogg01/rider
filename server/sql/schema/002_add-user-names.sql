-- +goose Up
ALTER TABLE users
ADD COLUMN given_name TEXT NOT NULL,
ADD COLUMN family_name TEXT NOT NULL;

-- +goose Down
ALTER TABLE users
DROP COLUMN IF EXISTS given_name,
DROP COLUMN IF EXISTS family_name;
