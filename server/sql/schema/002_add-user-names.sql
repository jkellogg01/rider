-- +goose Up
ALTER TABLE users
ADD name TEXT;

-- +goose Down
ALTER TABLE users
DROP COLUMN name;
