import { existsSync } from "node:fs";

// Load the local environment before importing the database helper, which
// reads DATABASE_URL at module load time. Values are never printed.
const envFile = ".env.local";
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

async function main() {
  const { sql } = await import("./db");
  const { movies } = await import("./movies");

  await sql`
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
    )
  `;

  for (const movie of movies) {
    await sql`
      INSERT INTO movies (
        id, title, year, genres, rating, tagline, description,
        featured, poster_from, poster_to
      )
      VALUES (
        ${movie.id}, ${movie.title}, ${movie.year}, ${movie.genres},
        ${movie.rating}, ${movie.tagline}, ${movie.description},
        ${movie.featured}, ${movie.poster.from}, ${movie.poster.to}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const result = await sql`SELECT COUNT(*)::int AS count FROM movies`;
  console.log(`Seeded ${movies.length} movies. Table now has ${result[0].count} row(s).`);
}

main().catch((error: unknown) => {
  console.error("Seeding failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
