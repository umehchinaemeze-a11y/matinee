export type Movie = {
  id: string;
  title: string;
  year: number;
  genres: string[];
  rating: number;
  tagline: string;
  description: string;
  featured: boolean;
  poster: {
    from: string;
    to: string;
  };
};

export const movies: Movie[] = [
  {
    id: "the-last-projection",
    title: "The Last Projection",
    year: 2024,
    genres: ["Drama", "Mystery"],
    rating: 8.7,
    tagline: "Every film ends. This one remembers.",
    description:
      "A retired projectionist discovers a reel that reveals the endings of films before they are made.",
    featured: true,
    poster: { from: "#1f1b3a", to: "#6d28d9" },
  },
  {
    id: "neon-skyline",
    title: "Neon Skyline",
    year: 2023,
    genres: ["Sci-Fi", "Thriller"],
    rating: 8.2,
    tagline: "The city never sleeps. Neither does it.",
    description:
      "In a rain-soaked megacity, a courier uncovers a signal hidden beneath the glow of the skyline.",
    featured: true,
    poster: { from: "#0f2a3d", to: "#06b6d4" },
  },
  {
    id: "paper-lanterns",
    title: "Paper Lanterns",
    year: 2025,
    genres: ["Romance", "Drama"],
    rating: 7.9,
    tagline: "Love floats where the light goes.",
    description:
      "Two strangers release lanterns on the same night and spend a year tracing them back to each other.",
    featured: true,
    poster: { from: "#3a1420", to: "#f43f5e" },
  },
  {
    id: "the-cartographer",
    title: "The Cartographer",
    year: 2022,
    genres: ["Adventure", "Fantasy"],
    rating: 8.4,
    tagline: "Some maps chart more than land.",
    description:
      "A mapmaker inherits a chart that redraws itself, leading her to places that should not exist.",
    featured: true,
    poster: { from: "#16331f", to: "#22c55e" },
  },
  {
    id: "midnight-expressway",
    title: "Midnight Expressway",
    year: 2024,
    genres: ["Crime", "Action"],
    rating: 7.6,
    tagline: "One road. No exits.",
    description:
      "A getaway driver takes one last job on a highway that loops back on itself every midnight.",
    featured: false,
    poster: { from: "#2b1a0e", to: "#f59e0b" },
  },
  {
    id: "harvest-moon",
    title: "Harvest Moon",
    year: 2021,
    genres: ["Drama"],
    rating: 7.8,
    tagline: "Some seasons stay with you.",
    description:
      "Three siblings return to the family farm for one final harvest before the land is sold.",
    featured: false,
    poster: { from: "#3a2b0e", to: "#eab308" },
  },
  {
    id: "static-and-signal",
    title: "Static & Signal",
    year: 2025,
    genres: ["Sci-Fi", "Horror"],
    rating: 7.3,
    tagline: "Turn it off. If you can.",
    description:
      "A late-night radio host receives calls from a station that stopped broadcasting decades ago.",
    featured: false,
    poster: { from: "#1a0f1f", to: "#8b5cf6" },
  },
  {
    id: "the-silent-choir",
    title: "The Silent Choir",
    year: 2023,
    genres: ["Mystery", "Thriller"],
    rating: 8.0,
    tagline: "They sing when no one is listening.",
    description:
      "A music teacher joins a choir whose members vanish after their first public performance.",
    featured: false,
    poster: { from: "#0f1b2b", to: "#3b82f6" },
  },
  {
    id: "golden-hour",
    title: "Golden Hour",
    year: 2022,
    genres: ["Romance", "Comedy"],
    rating: 7.4,
    tagline: "Sixty minutes to change everything.",
    description:
      "Two wedding photographers keep meeting during the last hour of sunlight.",
    featured: false,
    poster: { from: "#3a1c0a", to: "#fb923c" },
  },
  {
    id: "ironwood",
    title: "Ironwood",
    year: 2024,
    genres: ["Western", "Drama"],
    rating: 8.1,
    tagline: "Justice rides on iron wheels.",
    description:
      "A lone marshal defends a frontier town whose only train line carries more than passengers.",
    featured: false,
    poster: { from: "#22160d", to: "#a16207" },
  },
  {
    id: "cloud-atlas-heights",
    title: "Cloud Atlas Heights",
    year: 2025,
    genres: ["Animation", "Family"],
    rating: 8.5,
    tagline: "The highest place is closer than you think.",
    description:
      "A young inventor builds a flying machine to reach a city that only appears above the clouds.",
    featured: false,
    poster: { from: "#0f2333", to: "#38bdf8" },
  },
  {
    id: "the-marble-run",
    title: "The Marble Run",
    year: 2023,
    genres: ["Comedy", "Drama"],
    rating: 7.2,
    tagline: "Small things. Big stakes.",
    description:
      "A retired engineer enters an underground marble racing league to save his community center.",
    featured: false,
    poster: { from: "#2b1a3a", to: "#d946ef" },
  },
];

export type MovieRow = {
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

/**
 * Maps a flat database row from the movies table into the structured Movie domain model.
 */
export function mapMovieRow(row: MovieRow): Movie {
  if (!row || typeof row !== "object") {
    throw new TypeError("Database row must be a non-null object");
  }
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    genres: row.genres,
    rating: row.rating,
    tagline: row.tagline,
    description: row.description,
    featured: row.featured,
    poster: {
      from: row.poster_from,
      to: row.poster_to,
    },
  };
}

/**
 * Filters a movie list using in-memory search across title, year, tagline, and genres.
 */
export function filterMovies(movieList: Movie[], query: string): Movie[] {
  if (typeof query !== "string") return [];
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) return [];

  return movieList.filter((movie) => {
    const haystack = [
      movie.title,
      movie.year.toString(),
      movie.tagline,
      ...(Array.isArray(movie.genres) ? movie.genres : []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

/**
 * Partitions a movie list into featured and popular collections.
 */
export function partitionMovies(movieList: Movie[]): {
  featured: Movie[];
  popular: Movie[];
} {
  return {
    featured: movieList.filter((movie) => movie.featured),
    popular: movieList.filter((movie) => !movie.featured),
  };
}
