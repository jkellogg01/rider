-- +goose Up
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- +goose Down
DROP TABLE IF EXISTS users;
