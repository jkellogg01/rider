-- +goose Up
CREATE TABLE invitation (
  id serial PRIMARY KEY,
  body text UNIQUE NOT NULL,
  creator_id int NOT NULL REFERENCES account.id,
  band_id int NOT NULL REFERENCES band.id,
  created_at timestamp NOT NULL DEFAULT NOW(),
  expires_at timestamp NOT NULL,
);

-- +goose Down
DROP TABLE invitation;
