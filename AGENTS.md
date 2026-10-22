# AGENTS.md

Kesling: Laravel 13 (PHP 8.3+) + React 19 + Inertia v3 + Vite + Tailwind v4 + shadcn/ui (new-york). SQLite by default; Pest for tests.

## Commands

- Setup: `composer setup` (install deps, .env, key, migrate, npm install, build)
- Dev: `composer dev` (serve + queue:listen + vite concurrently)
- Build: `npm run build` (`npm run build:ssr` for SSR)
- Full check: `composer ci:check` (lint:check, format:check, types:check, tests)
- PHP lint: `composer lint` (fix) / `composer lint:check`
- JS lint: `npm run lint` (fix) / `npm run lint:check`
- Format: `npm run format` (fix) / `npm run format:check`
- Types: `npm run types:check`
- Tests: `composer test` (config:clear + lint:check + pest) or `./vendor/bin/pest`
- Single test: `./vendor/bin/pest tests/Feature/FooTest.php` or `--filter=name`

## Architecture

- Inertia pages: `resources/js/pages/*`; layouts: `resources/js/layouts/*`
- shadcn/ui components: `resources/js/components/ui/*` (vendored; ESLint ignores)
- Wayfinder generates `resources/js/actions`, `resources/js/routes`, `resources/js/wayfinder` during vite dev/build; gitignored, do not hand-edit
- Path alias `@/*` -> `resources/js/*`
- Routes: `routes/web.php`, `routes/settings.php`
- Auth via Fortify (two-factor); admin routes behind `admin` middleware

## Conventions

- PHP: Pint laravel preset
- TS/JS: ESLint import order (alphabetical), type-only imports, curly braces, blank lines around control statements
- Prettier: 4 spaces, single quotes, semicolons, Tailwind class sorting
- React compiler enabled via Vite

## Gotchas

- `composer test` runs `lint:check`; run `composer lint` + `npm run format` first on unformatted code
- `npm run build` must run before tests/CI and to regenerate Wayfinder files used by `tsc`
- Wayfinder dirs are missing after a clean checkout until `npm run dev`/`build`
- ESLint ignores generated dirs, `resources/js/components/ui/*`, and `vite.config.ts`
- Tests use in-memory SQLite (`DB_DATABASE=:memory:`)

## Antislop

For UI/copy/people/mobile/comments work, read `.agents/skills/antislop/SKILL.md`, then the matching skill in `.agents/skills/antislop-*/SKILL.md`. Resolve mode per antislop (session instruction > global preference > ask) and announce `antislop active: <mode> (<source>).` No `DESIGN.md` exists: ask for direction or label output "draft without direction" with dials ENERGY 1 / RHYTHM 1 / MOTION 1.