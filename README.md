# Matinee

A responsive movie-discovery interface built with [Next.js](https://nextjs.org) (App Router), TypeScript, and Tailwind CSS.

Matinee lets you browse featured and popular films, or search the catalog by title, genre, or year. This initial version runs entirely on **local mock data** — there is no live movie data, authentication, backend, or database yet.

## Features

- Matinee brand header with navigation
- Prominent search field with live results and a clear state
- Featured Movies and Popular Movies sections
- Movie cards with poster placeholders, title, release year, and genre
- Clear empty / no-results search state
- Mobile-friendly, responsive layout

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) 4

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project Structure

```
matinee/
├── app/
│   ├── globals.css      # Global styles and theme
│   ├── layout.tsx       # Root layout and metadata
│   └── page.tsx         # Movie discovery interface (client)
├── components/
│   ├── Header.tsx       # Brand header and navigation
│   ├── SearchBar.tsx    # Search input
│   ├── MovieCard.tsx    # Movie card with poster placeholder
│   └── MovieSection.tsx # Reusable movie grid section
├── lib/
│   └── movies.ts        # Local mock movie data and types
└── ...
```

## Notes

- Movie data lives in `lib/movies.ts` and is mock data for demo purposes only.
- Poster visuals are CSS gradient placeholders; no external images are fetched.
