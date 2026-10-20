import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

// Directly import real production data and shared production functions from lib/movies.ts
import {
  movies,
  mapMovieRow,
  filterMovies,
  partitionMovies,
} from "../lib/movies.ts";

/**
 * Validates a single movie object against the defined Movie schema.
 * Returns { valid: boolean, errors: string[] }
 * Used as a test assertion helper to verify movie record conformance.
 */
function validateMovieRecord(record) {
  const errors = [];
  if (!record || typeof record !== "object") {
    return { valid: false, errors: ["Record must be a non-null object"] };
  }

  // id: non-empty string, slug format
  if (typeof record.id !== "string" || record.id.trim().length === 0) {
    errors.push("Field 'id' must be a non-empty string");
  } else if (!/^[a-z0-9-]+$/.test(record.id)) {
    errors.push("Field 'id' must be a valid kebab-case slug");
  }

  // title: non-empty string
  if (typeof record.title !== "string" || record.title.trim().length === 0) {
    errors.push("Field 'title' must be a non-empty string");
  }

  // year: 4-digit positive integer
  if (
    typeof record.year !== "number" ||
    !Number.isInteger(record.year) ||
    record.year < 1888 ||
    record.year > 2100
  ) {
    errors.push("Field 'year' must be an integer between 1888 and 2100");
  }

  // genres: array of non-empty strings with at least one genre
  if (!Array.isArray(record.genres) || record.genres.length === 0) {
    errors.push("Field 'genres' must be a non-empty array of strings");
  } else {
    for (const g of record.genres) {
      if (typeof g !== "string" || g.trim().length === 0) {
        errors.push("Each genre in 'genres' must be a non-empty string");
        break;
      }
    }
  }

  // rating: number between 0.0 and 10.0
  if (
    typeof record.rating !== "number" ||
    Number.isNaN(record.rating) ||
    record.rating < 0 ||
    record.rating > 10
  ) {
    errors.push("Field 'rating' must be a number between 0.0 and 10.0");
  }

  // tagline: non-empty string
  if (typeof record.tagline !== "string" || record.tagline.trim().length === 0) {
    errors.push("Field 'tagline' must be a non-empty string");
  }

  // description: non-empty string
  if (typeof record.description !== "string" || record.description.trim().length === 0) {
    errors.push("Field 'description' must be a non-empty string");
  }

  // featured: boolean
  if (typeof record.featured !== "boolean") {
    errors.push("Field 'featured' must be a boolean");
  }

  // poster: object with valid hex colors { from: '#xxxxxx', to: '#xxxxxx' }
  const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
  if (!record.poster || typeof record.poster !== "object") {
    errors.push("Field 'poster' must be an object with 'from' and 'to' hex color properties");
  } else {
    if (typeof record.poster.from !== "string" || !hexColorRegex.test(record.poster.from)) {
      errors.push("Field 'poster.from' must be a valid 6-character hex color code (e.g. #1f1b3a)");
    }
    if (typeof record.poster.to !== "string" || !hexColorRegex.test(record.poster.to)) {
      errors.push("Field 'poster.to' must be a valid 6-character hex color code (e.g. #6d28d9)");
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Comparator function testing the ordering rule matching the SQL ORDER BY year DESC, id ASC specification.
 * Note: Exercises JavaScript sorting logic against the SQL query contract; does not execute live PostgreSQL.
 */
function compareMoviesOrder(a, b) {
  if (b.year !== a.year) {
    return b.year - a.year; // year DESC
  }
  return a.id.localeCompare(b.id); // id ASC
}

/**
 * Simulated API route handler for GET /api/movies matching app/api/movies/route.ts.
 * Uses the shared production mapMovieRow function to verify response formatting.
 */
async function simulateMoviesApiHandler(mockQueryFn) {
  try {
    const rows = await mockQueryFn();
    const result = rows.map(mapMovieRow);
    return {
      status: 200,
      headers: { "content-type": "application/json" },
      body: result,
    };
  } catch (err) {
    return {
      status: 500,
      headers: { "content-type": "application/json" },
      body: { error: "Unable to fetch movies." },
    };
  }
}

// --------------------------------------------------------------------------
// TEST SUITES
// --------------------------------------------------------------------------

describe("Suite 1: Seed Catalog Integrity & Schema Conformance", () => {
  it("contains exactly 12 movie records in the default catalog", () => {
    assert.equal(movies.length, 12, "Default movies catalog must contain exactly 12 items");
  });

  it("ensures every movie in the catalog has a unique identifier", () => {
    const ids = movies.map((m) => m.id);
    const uniqueIds = new Set(ids);
    assert.equal(uniqueIds.size, ids.length, "All movie identifiers must be unique");
  });

  it("ensures all seed movies pass comprehensive schema validation", () => {
    for (const movie of movies) {
      const { valid, errors } = validateMovieRecord(movie);
      assert.ok(valid, `Movie '${movie.id}' failed validation: ${errors.join(", ")}`);
    }
  });

  it("verifies rating values are within realistic cinematic bounds (0.0 to 10.0)", () => {
    for (const movie of movies) {
      assert.ok(
        movie.rating >= 0 && movie.rating <= 10,
        `Movie '${movie.id}' has out-of-range rating: ${movie.rating}`
      );
    }
  });

  it("verifies every movie defines a non-empty genres list", () => {
    for (const movie of movies) {
      assert.ok(
        Array.isArray(movie.genres) && movie.genres.length > 0,
        `Movie '${movie.id}' must have at least one genre`
      );
    }
  });

  it("verifies poster gradient hex colors are well-formed", () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    for (const movie of movies) {
      assert.match(
        movie.poster.from,
        hexRegex,
        `Movie '${movie.id}' poster.from must be a valid hex color`
      );
      assert.match(
        movie.poster.to,
        hexRegex,
        `Movie '${movie.id}' poster.to must be a valid hex color`
      );
    }
  });

  it("confirms presence of both featured and non-featured films in seed data", () => {
    const featuredCount = movies.filter((m) => m.featured).length;
    const popularCount = movies.filter((m) => !m.featured).length;
    assert.ok(featuredCount > 0, "Catalog must have at least one featured movie");
    assert.ok(popularCount > 0, "Catalog must have at least one popular/unfeatured movie");
    assert.equal(featuredCount + popularCount, movies.length);
  });
});

describe("Suite 2: Movie Schema Validation & Boundary Constraints (Test-Only Assertion Harness)", () => {
  const validMovie = {
    id: "sample-film",
    title: "Sample Film",
    year: 2024,
    genres: ["Drama", "Sci-Fi"],
    rating: 8.5,
    tagline: "A test tagline for validation.",
    description: "A comprehensive description of the sample movie.",
    featured: true,
    poster: { from: "#123456", to: "#abcdef" },
  };

  it("accepts a fully compliant movie record", () => {
    const result = validateMovieRecord(validMovie);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it("rejects non-object and null records", () => {
    assert.equal(validateMovieRecord(null).valid, false);
    assert.equal(validateMovieRecord(undefined).valid, false);
    assert.equal(validateMovieRecord("string").valid, false);
    assert.equal(validateMovieRecord(123).valid, false);
  });

  it("rejects movie record with missing or empty title", () => {
    const withoutTitle = { ...validMovie, title: "   " };
    const result = validateMovieRecord(withoutTitle);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes("title")));
  });

  it("rejects invalid rating numbers (negative, > 10, NaN, non-numeric)", () => {
    assert.equal(validateMovieRecord({ ...validMovie, rating: -0.5 }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, rating: 10.1 }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, rating: NaN }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, rating: "8.5" }).valid, false);
  });

  it("rejects invalid year values (out of range, float, non-numeric)", () => {
    assert.equal(validateMovieRecord({ ...validMovie, year: 1800 }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, year: 2200 }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, year: 2024.5 }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, year: "2024" }).valid, false);
  });

  it("rejects malformed poster hex colors (3-char hex, named colors, non-hex strings)", () => {
    assert.equal(validateMovieRecord({ ...validMovie, poster: { from: "#fff", to: "#000000" } }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, poster: { from: "red", to: "#000000" } }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, poster: { from: "#1234567", to: "#000000" } }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, poster: null }).valid, false);
  });

  it("rejects empty genres array and non-string genre entries", () => {
    assert.equal(validateMovieRecord({ ...validMovie, genres: [] }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, genres: ["Action", ""] }).valid, false);
    assert.equal(validateMovieRecord({ ...validMovie, genres: ["Action", 123] }).valid, false);
  });
});

describe("Suite 3: Database Row to Movie Transformation (Shared Production Function: mapMovieRow)", () => {
  const sampleDbRow = {
    id: "sample-movie",
    title: "Sample Movie Title",
    year: 2024,
    genres: ["Adventure", "Mystery"],
    rating: 8.4,
    tagline: "Uncover the secret.",
    description: "Full descriptive text from database.",
    featured: true,
    poster_from: "#112233",
    poster_to: "#445566",
  };

  it("maps flat SQL database columns into nested Movie domain object via production mapMovieRow", () => {
    const movie = mapMovieRow(sampleDbRow);
    assert.equal(movie.id, "sample-movie");
    assert.equal(movie.title, "Sample Movie Title");
    assert.equal(movie.year, 2024);
    assert.deepEqual(movie.genres, ["Adventure", "Mystery"]);
    assert.equal(movie.rating, 8.4);
    assert.equal(movie.tagline, "Uncover the secret.");
    assert.equal(movie.description, "Full descriptive text from database.");
    assert.equal(movie.featured, true);
    assert.deepEqual(movie.poster, { from: "#112233", to: "#445566" });
  });

  it("preserves boolean featured values from database rows", () => {
    assert.strictEqual(mapMovieRow({ ...sampleDbRow, featured: true }).featured, true);
    assert.strictEqual(mapMovieRow({ ...sampleDbRow, featured: false }).featured, false);
  });

  it("throws TypeError on non-object database row input", () => {
    assert.throws(() => mapMovieRow(null), TypeError);
    assert.throws(() => mapMovieRow(undefined), TypeError);
    assert.throws(() => mapMovieRow("raw-string"), TypeError);
  });

  it("correctly produces a Movie record that passes validateMovieRecord", () => {
    const mapped = mapMovieRow(sampleDbRow);
    const { valid, errors } = validateMovieRecord(mapped);
    assert.ok(valid, `Mapped movie should be valid: ${errors.join(", ")}`);
  });
});

describe("Suite 4: Query Sorting Specification & Contract (ORDER BY year DESC, id ASC)", () => {
  const unsortedMovies = [
    { id: "zeta-film", year: 2023 },
    { id: "alpha-film", year: 2024 },
    { id: "beta-film", year: 2024 },
    { id: "gamma-film", year: 2021 },
    { id: "delta-film", year: 2023 },
  ];

  it("orders movies with most recent year first", () => {
    const sorted = [...unsortedMovies].sort(compareMoviesOrder);
    assert.equal(sorted[0].year, 2024);
    assert.equal(sorted[1].year, 2024);
    assert.equal(sorted[2].year, 2023);
    assert.equal(sorted[3].year, 2023);
    assert.equal(sorted[4].year, 2021);
  });

  it("breaks ties within the same year by id in ascending alphabetical order", () => {
    const sorted = [...unsortedMovies].sort(compareMoviesOrder);
    // In 2024: alpha-film comes before beta-film
    assert.equal(sorted[0].id, "alpha-film");
    assert.equal(sorted[1].id, "beta-film");
    // In 2023: delta-film comes before zeta-film
    assert.equal(sorted[2].id, "delta-film");
    assert.equal(sorted[3].id, "zeta-film");
  });

  it("preserves order when year and id are identical", () => {
    const identical = [
      { id: "same-id", year: 2024 },
      { id: "same-id", year: 2024 },
    ];
    const sorted = [...identical].sort(compareMoviesOrder);
    assert.equal(compareMoviesOrder(identical[0], identical[1]), 0);
    assert.equal(sorted.length, 2);
  });
});

describe("Suite 5: Catalog Search and Filtering Engine (Shared Production Functions: filterMovies, partitionMovies)", () => {
  it("returns empty array when query is empty, whitespace, or non-string", () => {
    assert.deepEqual(filterMovies(movies, ""), []);
    assert.deepEqual(filterMovies(movies, "   "), []);
    assert.deepEqual(filterMovies(movies, null), []);
    assert.deepEqual(filterMovies(movies, undefined), []);
    assert.deepEqual(filterMovies(movies, 123), []);
  });

  it("finds movies by title (case-insensitive substring match)", () => {
    const matches = filterMovies(movies, "last projection");
    assert.ok(matches.length >= 1);
    assert.equal(matches[0].id, "the-last-projection");

    const uppercaseMatch = filterMovies(movies, "NEON");
    assert.ok(uppercaseMatch.some((m) => m.id === "neon-skyline"));
  });

  it("finds movies by genre match", () => {
    const sciFiMatches = filterMovies(movies, "sci-fi");
    assert.ok(sciFiMatches.length >= 2, "Expected multiple Sci-Fi films in catalog");
    for (const m of sciFiMatches) {
      assert.ok(
        m.genres.some((g) => g.toLowerCase().includes("sci-fi")),
        `Movie ${m.id} should include Sci-Fi in genres`
      );
    }
  });

  it("finds movies by release year match", () => {
    const year2024Matches = filterMovies(movies, "2024");
    assert.ok(year2024Matches.length > 0);
    for (const m of year2024Matches) {
      assert.ok(
        m.year.toString().includes("2024") ||
          m.title.includes("2024") ||
          m.tagline.includes("2024"),
        `Movie ${m.id} should match 2024`
      );
    }
  });

  it("finds movies by tagline words", () => {
    const matches = filterMovies(movies, "remembers");
    assert.ok(matches.length >= 1);
    assert.equal(matches[0].id, "the-last-projection");
  });

  it("returns empty array when no movies match the search query", () => {
    const noResults = filterMovies(movies, "completely_unmatched_query_xyz_999");
    assert.deepEqual(noResults, []);
  });

  it("correctly partitions catalog into featured and popular groups with no overlaps via production partitionMovies", () => {
    const { featured, popular } = partitionMovies(movies);
    assert.equal(
      featured.length + popular.length,
      movies.length,
      "Sum of featured and popular must equal total movies"
    );

    for (const m of featured) {
      assert.strictEqual(m.featured, true, `Movie ${m.id} in featured must have featured === true`);
    }

    for (const m of popular) {
      assert.strictEqual(m.featured, false, `Movie ${m.id} in popular must have featured === false`);
    }

    // Mutual exclusivity
    const featuredIds = new Set(featured.map((m) => m.id));
    for (const m of popular) {
      assert.ok(!featuredIds.has(m.id), `Movie ${m.id} should not appear in both sections`);
    }
  });
});

describe("Suite 6: API Response Structure & Error Handling Simulation", () => {
  it("returns HTTP 200 with JSON payload when database returns valid rows using production mapMovieRow", async () => {
    const mockDbQuery = async () => [
      {
        id: "film-one",
        title: "Film One",
        year: 2025,
        genres: ["Action"],
        rating: 9.0,
        tagline: "Action tagline",
        description: "Action description",
        featured: true,
        poster_from: "#111111",
        poster_to: "#222222",
      },
    ];

    const response = await simulateMoviesApiHandler(mockDbQuery);
    assert.equal(response.status, 200);
    assert.equal(response.headers["content-type"], "application/json");
    assert.equal(response.body.length, 1);
    assert.equal(response.body[0].id, "film-one");
    assert.deepEqual(response.body[0].poster, { from: "#111111", to: "#222222" });
  });

  it("returns HTTP 500 with sanitized error message when database query rejects", async () => {
    const mockFailingQuery = async () => {
      throw new Error("Neon database connection pool timeout");
    };

    const response = await simulateMoviesApiHandler(mockFailingQuery);
    assert.equal(response.status, 500);
    assert.equal(response.headers["content-type"], "application/json");
    assert.deepEqual(response.body, { error: "Unable to fetch movies." });
  });

  it("handles empty database results gracefully by returning an empty JSON array", async () => {
    const mockEmptyQuery = async () => [];

    const response = await simulateMoviesApiHandler(mockEmptyQuery);
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, []);
  });
});
