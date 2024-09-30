-- +goose Up
CREATE TABLE band (
  id SERIAL PRIMARY KEY,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  name text NOT NULL
);

CREATE TABLE account_band (
  id SERIAL PRIMARY KEY,
  account_id int REFERENCES account (id),
  band_id int REFERENCES band (id),
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  account_is_admin boolean NOT NULL DEFAULT FALSE,
  UNIQUE (account_id, band_id)
);

-- +goose Down
DROP TABLE account_band;
DROP TABLE band;
