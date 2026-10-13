-- Matinee movies table.
-- The poster gradient colors are stored as two text columns and recombined
-- into the `poster` object by the API layer.

CREATE TABLE IF NOT EXISTS movies (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  year        INTEGER NOT NULL,
  genres      TEXT[] NOT NULL DEFAULT '{}',
  rating      DOUBLE PRECISION NOT NULL,
  tagline     TEXT NOT NULL,
  description TEXT NOT NULL,
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  poster_from TEXT NOT NULL,
  poster_to   TEXT NOT NULL
);
