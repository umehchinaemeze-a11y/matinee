import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapMovieRow, type MovieRow } from "@/lib/movies";

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        id,
        title,
        year,
        genres,
        rating,
        tagline,
        description,
        featured,
        poster_from,
        poster_to
      FROM movies
      ORDER BY year DESC, id ASC
    `;

    const movies = (rows as MovieRow[]).map(mapMovieRow);

    return NextResponse.json(movies);
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    return NextResponse.json(
      { error: "Unable to fetch movies." },
      { status: 500 }
    );
  }
}
