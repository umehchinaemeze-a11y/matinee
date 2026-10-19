# Matinee — Technical Documentation

## 1. Project overview and scope

Matinee is a responsive movie-discovery interface. It lets users browse featured and
popular films, or search the catalog by title, genre, or year. The movie catalog is
served from a PostgreSQL database (hosted on Neon) through a single HTTP endpoint,
`GET /api/movies`.

The project consists of two parts:

- **Web app** — a Next.js application deployed to Vercel at
  <https://matinee-two.vercel.app/>.
- **Android development build** — a Capacitor wrapper that loads the deployed website
  in an Android WebView (see section 10).

Scope is intentionally limited to a single catalog endpoint and a read-only,
client-side search experience. There is no authentication, no write API, and no
admin interface.

## 2. Technology stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Web framework | Next.js (App Router) | 16.4.0 |
| UI library | React | 19.3.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 (via `@tailwindcss/turbopack`) |
| Database driver | `@neondatabase/serverless` | ^1.2.0 |
| Database | PostgreSQL (Neon) | — |
| Mobile wrapper | Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`) | ^8.5.3 |
| Seed/CLI runner | `tsx` | ^4.23.15 |
| Linting | ESLint + `eslint-config-next` | ^9 / 16.4.0 |

Verified local tooling (during the Android build): Node.js `v24.19.0`, npm `12.0.2`.

## 3. Application architecture and request flow

The frontend is a single client-side page that fetches the movie catalog from the
serverless API route and renders it.

```text
Browser / WebView
   │  1. GET /api/movies  (relative fetch)
   ▼
Next.js route handler  (app/api/movies/route.ts)
   │  2. sql`SELECT ... FROM movies ORDER BY year DESC, id ASC`
   ▼
lib/db.ts  (neon(DATABASE_URL))
   │  3. PostgreSQL (Neon)
   ▼
JSON array of movies  ──►  rendered by app/page.tsx
```

Key flow details:

- `app/page.tsx` is a client component (`"use client"`). On mount it calls
  `fetch("/api/movies")`, stores the result in React state, and derives two lists:
  **Featured** (`movie.featured === true`) and **Popular** (everything else).
- Search is **client-side only**: the query string is matched against the movie's
  `title`, `year`, `tagline`, and `genres` in memory. No search is sent to the server.
- `app/api/movies/route.ts` reads the database through `lib/db.ts`, which exports a
  `neon()` query function bound to `DATABASE_URL`.
- Loading, error, empty, and no-results states are handled in `app/page.tsx`.

`next.config.ts` enables Turbopack (with a Tailwind CSS loader rule) and the
`experimental.agentFeedback`, `cacheComponents`, and `partialPrefetching` flags. These
are server-side Next.js features and are not part of the Android build.

## 4. Next.js frontend structure

```text
matinee/
├── app/
│   ├── api/movies/route.ts   # GET /api/movies (reads PostgreSQL)
│   ├── globals.css           # Tailwind import + theme tokens
│   ├── layout.tsx            # Root layout, fonts, metadata
│   └── page.tsx              # Movie discovery interface (client)
├── components/
│   ├── Header.tsx            # Brand header and anchor navigation
│   ├── SearchBar.tsx         # Controlled search input with clear button
│   ├── MovieCard.tsx         # Gradient poster placeholder + metadata
│   └── MovieSection.tsx      # Reusable titled movie grid section
├── lib/
│   ├── db.ts                 # Neon PostgreSQL connection helper
│   ├── movies.ts             # Shared Movie type + seed data (12 movies)
│   ├── schema.sql            # movies table definition
│   └── seed.ts               # Idempotent database seed script
├── capacitor.config.ts       # Capacitor configuration
├── next.config.ts            # Next.js / Turbopack configuration
├── tsconfig.json             # TypeScript config (path alias `@/*` -> `./*`)
├── package.json              # Dependencies and scripts
└── www/index.html            # Placeholder web dir for Capacitor
```

Notes:

- The shared `Movie` type lives in `lib/movies.ts` and is imported by both the API
  route and the UI.
- Poster visuals are CSS gradient placeholders. Each movie stores two colors
  (`poster.from`, `poster.to`) that `MovieCard` renders as a `linear-gradient`. No
  external poster images are fetched.

## 5. Movies API endpoint

### `GET /api/movies`

Implemented in `app/api/movies/route.ts`. No parameters, no authentication.

- Reads all rows from the `movies` table, ordered by `year DESC, id ASC`.
- Maps each row to the shared `Movie` shape and returns `NextResponse.json(movies)`.
- On error, returns HTTP 500 with `{ "error": "Unable to fetch movies." }`.

### Response structure (array of `Movie`)

```json
[
  {
    "id": "the-last-projection",
    "title": "The Last Projection",
    "year": 2024,
    "genres": ["Drama", "Mystery"],
    "rating": 8.7,
    "tagline": "Every film ends. This one remembers.",
    "description": "A retired projectionist discovers a reel ...",
    "featured": true,
    "poster": { "from": "#1f1b3a", "to": "#6d28d9" }
  }
]
```

The API combines the `poster_from` and `poster_to` columns into the nested `poster`
object. In the deployed environment the endpoint returns all 12 seeded movies.

## 6. PostgreSQL / Neon database schema and seeding

### Schema (`lib/schema.sql`)

```sql
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
);
```

### Seeding (`lib/seed.ts`)

`npm run db:seed` (run via `tsx lib/seed.ts`) performs the following:

1. Loads `.env.local` if present (`process.loadEnvFile`) so `DATABASE_URL` is
   available before the database helper is imported.
2. Creates the `movies` table if it does not exist.
3. Inserts the 12 movies defined in `lib/movies.ts` using
   `ON CONFLICT (id) DO NOTHING`, so re-running the seed is idempotent.
4. Logs the number of movies inserted and the final row count.

The schema can also be applied manually with
`psql "$DATABASE_URL" -f lib/schema.sql`.

## 7. Environment variables

| Variable | Purpose | Notes |
|----------|---------|-------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Read by `lib/db.ts`; required at runtime |

- `.env.local` holds the real value and is Git-ignored (the `.gitignore` rule
  `.env*` with `!.env.example`). It must never be committed.
- `.env.example` is a template containing only `DATABASE_URL=` — copy it to
  `.env.local` and fill in your value.

Placeholder:

```text
DATABASE_URL=<your-neon-connection-string>
```

No other environment variables are used by the application.

## 8. Local installation and development

```bash
# 1. Install dependencies
npm install

# 2. Configure the database (copy the template and fill in the real value)
cp .env.example .env.local     # then set DATABASE_URL

# 3. Create the table and seed 12 movies (idempotent)
npm run db:seed

# 4. Start the development server
npm run dev                    # http://localhost:3000
```

Available scripts (from `package.json`):

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start the development server |
| `build` | `next build` | Create a production build |
| `start` | `next start` | Serve the production build |
| `lint` | `eslint` | Run ESLint |
| `db:seed` | `tsx lib/seed.ts` | Create the table and seed sample movies |

There is no `test` script; automated tests are not currently configured.

## 9. Production deployment and API verification

- **Deployment:** Vercel.
- **Production website:** <https://matinee-two.vercel.app/>
- **Production API:** <https://matinee-two.vercel.app/api/movies>

The production API responds with `HTTP 200` and returns the full seeded catalog
(12 movies) with the structure documented in section 5.

## 10. Android development build (Capacitor)

The Android app is a **development build** that wraps the deployed website. It does
**not** bundle the Next.js application, the API route, or the database. It loads the
live site through Capacitor's `server.url` setting and therefore **requires an
internet connection**.

### Configuration (`capacitor.config.ts`)

```ts
const config: CapacitorConfig = {
  appId: 'com.matinee.app',
  appName: 'Matinee',
  webDir: 'www',
  server: {
    url: 'https://matinee-two.vercel.app/',
    cleartext: false,
  },
  androidScheme: 'https',
};
```

### Android project settings

| Setting | Value |
|---------|-------|
| Application ID | `com.matinee.app` |
| Android Gradle Plugin | `8.13.0` |
| Gradle wrapper | `8.14.3` |
| `compileSdk` / `targetSdk` | `36` |
| `minSdk` | `24` |

### Build prerequisites

- Android SDK (`ANDROID_HOME`) installed.
- A JDK **21** (not 25) for Gradle. Gradle `8.14.3` does not support Java 25. The
  project pins JDK 21 for this build only via
  `android/gradle.properties`:

  ```properties
  org.gradle.java.home=C:/Users/umehc/AppData/Local/Programs/Eclipse Adoptium/jdk-21.0.12.1+1
  ```

  (This path is machine-specific.) The Android SDK location is provided by
  `android/local.properties` (`sdk.dir`), which is Git-ignored.

### Build steps

```bash
# From the project root
npx cap add android        # first time only (already present in this repo)
npx cap sync android       # copy web assets + generate native config

# From android/
.\gradlew.bat assembleDebug
```

The debug APK is produced at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Install and launch on a device/emulator

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.matinee.app -c android.intent.category.LAUNCHER 1
```

On launch, Capacitor logs `Loading app at https://matinee-two.vercel.app/`, and the
WebView renders the live website. The movie catalog is fetched same-origin from the
deployed `/api/movies`, so no CORS or backend changes are required.

**Important:** this is a development configuration. `server.url` is documented by
Capacitor as intended for development/live-reload and not for production. The app is
**not** a standalone/offline build — a network connection is required.

## 11. Testing and verification already performed

- **Android debug APK build** — `.\gradlew.bat assembleDebug` completed successfully
  (`BUILD SUCCESSFUL`).
- **APK install** — `adb install -r` reported `Success` on the `Medium_Phone_API_37.0`
  emulator.
- **App launch** — `com.matinee.app/.MainActivity` reached `RESUMED`; Capacitor logged
  `Loading app at https://matinee-two.vercel.app/`.
- **Live movie catalog** — visually confirmed working in the Android emulator.
- **Production API reachability** — `GET https://matinee-two.vercel.app/api/movies`
  returned `HTTP 200`; the deployed endpoint returns the 12 seeded movies.
- **Recorded in the project inventory** — local lint and production build passed
  before deployment.

No automated test suite exists in the repository, so no automated test results are
available.

## 12. Known limitations and remaining work

- The Android app is a development build only; it loads the deployed website and is
  not a standalone/offline application. A self-contained export would require
  static-export compatibility work (the server route and server-only Next.js features
  currently prevent `output: 'export'`) plus a strategy for the API (native HTTP or
  backend CORS).
- The `/api/movies` route handler is server-only and is not packaged into the Android
  app; the app depends on the deployed API.
- Search is performed entirely on the client against the in-memory catalog; there is
  no server-side search endpoint.
- Poster images are CSS gradient placeholders, not real image assets.
- Automated tests are not present in the repository. Baseline load-test results are documented in LOAD-TEST-RESULTS.md. Links to the external Figma prototype and demo video are recorded in the root SUBMISSION.md and PROJECT-INVENTORY.md (neither resource is stored directly inside this repository).
- Capacitor's `server.url` approach is intended for development, not for a
  store-ready release.
