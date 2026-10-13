import type { Movie } from "@/lib/movies";

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/25">
      <div
        className="relative flex aspect-[2/3] items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${movie.poster.from} 0%, ${movie.poster.to} 100%)`,
        }}
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/25 transition group-hover:scale-110 group-hover:text-white/40"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="7" y1="3" x2="7" y2="21" />
          <line x1="17" y1="3" x2="17" y2="21" />
          <line x1="3" y1="8" x2="7" y2="8" />
          <line x1="3" y1="16" x2="7" y2="16" />
          <line x1="17" y1="8" x2="21" y2="8" />
          <line x1="17" y1="16" x2="21" y2="16" />
        </svg>

        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
          {movie.rating.toFixed(1)}
        </span>

        <span className="absolute bottom-3 left-3 right-3 truncate text-xs font-semibold uppercase tracking-widest text-white/80">
          {movie.genres[0]}
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate font-bold leading-snug" title={movie.title}>
          {movie.title}
        </h3>
        <p className="mt-1 text-sm text-white/60">
          {movie.year} · {movie.genres.join(" · ")}
        </p>
      </div>
    </article>
  );
}
