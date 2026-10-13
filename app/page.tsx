"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import MovieSection from "@/components/MovieSection";
import MovieCard from "@/components/MovieCard";
import { movies } from "@/lib/movies";

export default function Home() {
  const [query, setQuery] = useState("");

  const featured = useMemo(() => movies.filter((movie) => movie.featured), []);
  const popular = useMemo(() => movies.filter((movie) => !movie.featured), []);

  const normalized = query.trim().toLowerCase();
  const searching = normalized.length > 0;

  const results = useMemo(() => {
    if (!searching) return [];
    return movies.filter((movie) => {
      const haystack = [
        movie.title,
        movie.year.toString(),
        movie.tagline,
        ...movie.genres,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [normalized, searching]);

  return (
    <main id="home" className="min-h-screen bg-[#0b0b0f] text-[#f5f1e8]">
      <Header />

      <section className="border-b border-white/10 bg-gradient-to-b from-[#1a1408] to-[#0b0b0f]">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:px-10 md:pb-20 md:pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f5c518]">
            Your evening starts here
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Find your next <span className="text-[#f5c518]">favorite film.</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/60">
            Browse the Matinee catalog of featured and popular movies, or search
            by title, genre, or year.
          </p>
          <div className="mt-8 max-w-xl">
            <SearchBar value={query} onChange={setQuery} />
          </div>
        </div>
      </section>

      {searching ? (
        <section className="mx-auto max-w-7xl px-6 py-12 md:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f5c518]">
            Search results
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            Results for “{query.trim()}”
          </h2>

          {results.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-white/40"
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
              <h3 className="mt-5 text-xl font-bold">No movies found</h3>
              <p className="mx-auto mt-2 max-w-md text-white/55">
                We couldn’t find any movies matching “{query.trim()}”. Try a
                different title, genre, or year.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-6 rounded-full bg-[#f5c518] px-6 py-3 font-semibold text-[#0b0b0f] transition hover:bg-white"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <MovieSection
            id="featured"
            eyebrow="Featured"
            title="Featured Movies"
            subtitle="Hand-picked films to watch tonight."
            movies={featured}
          />
          <MovieSection
            id="popular"
            eyebrow="Popular"
            title="Popular Movies"
            subtitle="What everyone is watching right now."
            movies={popular}
          />
        </>
      )}

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <p>© 2026 Matinee. Demo built with local mock data.</p>
          <p>Next.js · React · Tailwind CSS</p>
        </div>
      </footer>
    </main>
  );
}
