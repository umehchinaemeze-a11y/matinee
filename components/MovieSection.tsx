import type { Movie } from "@/lib/movies";
import MovieCard from "./MovieCard";

type MovieSectionProps = {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  movies: Movie[];
};

export default function MovieSection({
  id,
  eyebrow,
  title,
  subtitle,
  movies,
}: MovieSectionProps) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-6 py-12 md:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f5c518]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-xl text-sm text-white/55">{subtitle}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
