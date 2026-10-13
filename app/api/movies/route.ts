import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Movie } from "@/lib/movies";

type MovieRow = {
  id: string;
  title: string;
  year: number;
  genres: string[];
  rating: number;
  tagline: string;
  description: string;
  featured: boolean;
  poster_from: string;
  poster_to: string;
};

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

    const movies: Movie[] = (rows as MovieRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      year: row.year,
      genres: row.genres,
      rating: row.rating,
      tagline: row.tagline,
      description: row.description,
      featured: row.featured,
      poster: { from: row.poster_from, to: row.poster_to },
    }));

    return NextResponse.json(movies);
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    return NextResponse.json(
      { error: "Unable to fetch movies." },
      { status: 500 }
    );
  }
}
