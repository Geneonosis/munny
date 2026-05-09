# munny 💰

> The open source, local-first money management system. Break away from subscription-based financial software and take full control of your financial future.

Munny runs entirely on your own machine inside Docker. Your data never leaves your hands.

---

## Table of Contents

- [Run Locally (Production)](#run-locally-production)
- [Developer Getting Started](#developer-getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)

---

## Run Locally (Production)

This is the recommended path if you just want to use Munny to manage your finances. No Node.js install required — only Docker.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/munny.git
   cd munny
   ```

2. **Start the app**

   ```bash
   docker compose up --build
   ```

   On first run this will:
   - Build the production image
   - Run database migrations automatically
   - Start the app on port **43557**

3. **Open your browser**

   Navigate to [http://localhost:43557](http://localhost:43557)

4. **Stopping the app**

   ```bash
   docker compose down
   ```

   Your data is persisted in a named Docker volume (`munny-db-data`) and will survive restarts.

### Updating to a newer version

```bash
git pull
docker compose up --build
```

Migrations run automatically on startup so your data is always kept up to date.

---

## Developer Getting Started

Follow these steps if you want to contribute to Munny or run it in development mode with hot-reloading and seed data.

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- npm (comes with Node.js)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/munny.git
   cd munny
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up your environment**

   Copy the example env file and adjust if needed:

   ```bash
   cp .env.local.example .env.local
   ```

   The default `.env.local` points to `data/munny-dev.db` which is used by the dev container.

4. **Start the dev container**

   The dev container builds the app, seeds the database with mock data, and starts the server:

   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

   Open [http://localhost:43557](http://localhost:43557) to see the app with seed data loaded.

5. **Run the app locally (without Docker)**

   If you prefer to run Next.js directly on your machine:

   ```bash
   npm run migrate:dev   # apply migrations and seed the dev database
   npm run dev           # start the Next.js dev server with hot-reload
   ```

   Open [http://localhost:3000](http://localhost:3000) — when running directly via `npm run dev`, Next.js uses its default port 3000.

### Useful commands

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with hot-reload |
| `npm run build` | Production build |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Run Biome linter and auto-fix |
| `npm run format` | Auto-format all files with Biome |
| `npm run migrate` | Run production database migrations |
| `npm run migrate:dev` | Run dev migrations + seed mock data |
| `npm run db:generate` | Generate new Drizzle migration files |

### Making schema changes

1. Edit `db/schema.ts`
2. Generate a migration:
   ```bash
   npm run db:generate
   ```
3. Apply it to the dev database:
   ```bash
   npm run migrate:dev
   ```

---

## Project Structure

```
munny/
├── app/                  # Next.js app router (pages + API routes)
│   ├── api/              # REST API endpoints
│   └── buckets/          # Bucket detail pages
├── components/           # React components
│   └── ui/               # shadcn/ui base components
├── db/                   # Drizzle ORM schema, client, and seed data
├── drizzle/              # Auto-generated migration SQL files
├── lib/                  # Shared utilities and client-side state
├── scripts/              # Migration runner scripts
├── http/                 # .http files for manual API testing
├── docker-compose.yml        # Production compose file
└── docker-compose.dev.yml    # Development compose file (with seed data)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) |
| Database | [SQLite](https://www.sqlite.org/) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) |
| Charts | [Recharts](https://recharts.org/) + [Nivo](https://nivo.rocks/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Linting/Formatting | [Biome](https://biomejs.dev/) |
| Runtime | [Node.js 20](https://nodejs.org/) |
| Containerization | [Docker](https://www.docker.com/) |

---

## Data & Privacy

Munny is **local-first**. All data is stored in a SQLite database on your own machine (or Docker volume). Nothing is transmitted to any external server.

