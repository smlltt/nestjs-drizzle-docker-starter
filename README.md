# NestJS + Drizzle + Docker + PostgreSQL

This project is a Dockerized NestJS API that uses:

- NestJS 11
- Drizzle ORM
- PostgreSQL 16
- Docker Compose

It is set up similarly to a TypeORM + Docker walkthrough, but with Drizzle ORM and SQL migrations.

## Quick Start (Docker)

1. From the project root:

```bash
docker compose up --build
```

2. Verify API:

```bash
curl http://localhost:3000/
```

Expected response:

```json
{
  "status": "ok",
  "database": "up"
}
```

## Local Docker + pgAdmin (easy mode)

This setup is for learning and quick prototyping.

1. Use local defaults:

```bash
cp .env.example .env
```

2. Start local stack (`api` + `postgres` + `pgadmin`):

```bash
docker compose -f docker-compose.local.yml up --build
```

3. Open:

- API: `http://localhost:3000`
- pgAdmin: `http://localhost:5050`

4. Login to pgAdmin with values from `.env`:

- Email: `PGADMIN_DEFAULT_EMAIL` (default `admin@admin.com`)
- Password: `PGADMIN_DEFAULT_PASSWORD` (default `admin`)

5. In pgAdmin, add a new server with:

- Name: `local-postgres` (any name)
- Host: `postgres`
- Port: `5432`
- Maintenance DB: `postgres`
- Username: `DB_USER` (default `postgres`)
- Password: `DB_PASSWORD` (default `postgres`)

Optional cleanup:

```bash
docker compose -f docker-compose.local.yml down
```

Remove volumes too (deletes database data):

```bash
docker compose -f docker-compose.local.yml down -v
```

## Local Development (without Docker)

1. Start PostgreSQL (docker or local install).
2. Copy `.env.example` to `.env` and adjust values if needed.
3. Install dependencies:

```bash
npm install
```

4. Generate migrations after schema changes:

```bash
npm run db:generate
```

5. Start app:

```bash
npm run start:dev
```

The app runs migrations on startup when `RUN_MIGRATIONS=true`.

## Drizzle Commands

- `npm run db:generate`: create SQL migration files from schema changes
- `npm run db:migrate`: apply pending migrations manually
- `npm run db:studio`: open Drizzle Studio

## Project Structure

- `src/database/schema.ts`: Drizzle table definitions
- `src/database/database.service.ts`: connection + startup migrations + health ping
- `drizzle/`: generated SQL migrations
- `drizzle.config.ts`: Drizzle Kit config
- `docker-compose.yml`: API + PostgreSQL services
- `docker-compose.local.yml`: local dev stack with pgAdmin
- `Dockerfile`: multi-stage production image
- `Dockerfile.local`: simple local dev image
