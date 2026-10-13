# Matinee

A responsive movie-discovery interface built with [Next.js](https://nextjs.org) (App Router), TypeScript, and Tailwind CSS.

Matinee lets you browse featured and popular films, or search the catalog by title, genre, or year. The movie catalog is served from a PostgreSQL database (via [Neon](https://neon.tech)) through the `/api/movies` endpoint.

## Features

- Matinee brand header with navigation
- Prominent search field with live results and a clear state
- Featured Movies and Popular Movies sections
- Movie cards with poster placeholders, title, release year, and genre
- Clear empty / no-results search state
- Loading and error states when fetching the catalog
- Mobile-friendly, responsive layout

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) 4
- [Neon](https://neon.tech) PostgreSQL via `@neondatabase/serverless`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

Create a `.env.local` file in the project root (it is Git-ignored and never committed):

```bash
DATABASE_URL=your_neon_connection_string
```

`.env.example` is a template containing only `DATABASE_URL=` — copy it and fill in your value. Never commit real credentials.

### 3. Create the table and seed the data

The schema is documented in `lib/schema.sql`. You can apply it manually in the Neon SQL editor (or via `psql`), then run the seed script:

```bash
npm run db:seed
```

The seed script creates the `movies` table if it does not exist and inserts the 12 sample movies idempotently (duplicates are skipped via `ON CONFLICT DO NOTHING`).

Alternatively, apply both files with `psql`:

```bash
psql "$DATABASE_URL" -f lib/schema.sql
# then insert data using the seed script above
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run db:seed` — create the table and seed the sample movies

## Project Structure

```
matinee/
├── app/
│   ├── api/movies/route.ts  # GET /api/movies (reads from PostgreSQL)
│   ├── globals.css          # Global styles and theme
│   ├── layout.tsx           # Root layout and metadata
│   └── page.tsx             # Movie discovery interface (client)
├── components/
│   ├── Header.tsx           # Brand header and navigation
│   ├── SearchBar.tsx        # Search input
│   ├── MovieCard.tsx        # Movie card with poster placeholder
│   └── MovieSection.tsx     # Reusable movie grid section
├── lib/
│   ├── db.ts                # Neon PostgreSQL connection helper
│   ├── movies.ts            # Shared Movie type and seed data
│   ├── schema.sql           # movies table definition
│   └── seed.ts              # Idempotent database seed script
└── ...
```

## Notes

- The shared `Movie` type lives in `lib/movies.ts`; both the API route and the UI import it from there.
- Poster visuals are CSS gradient placeholders (colors stored in the database as `poster_from`/`poster_to`); no external images are fetched.
- `lib/movies.ts` still holds the seed data used by `npm run db:seed`, but the running app loads movies from `/api/movies`.
