# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Wheel of Flavours** — a single Next.js 16 app (not a monorepo). No database, no Docker, no backend services. It discovers nearby restaurants via Google Places API and lets users spin a wheel to pick one.

### Running the dev server

```bash
npm run dev
```

Starts Next.js 16 with Turbopack on **HTTPS** (`https://localhost:3000`) using `--experimental-https` and self-signed certificates. See `README.md` for full setup instructions.

### Key caveats

- **`next lint` does not exist in Next.js 16.** The `npm run lint` script (`next lint`) fails because v16 removed the `lint` subcommand. Use `npx tsc --noEmit` for type checking. ESLint also has a pre-existing circular reference error with the current `eslint.config.mjs` + `@eslint/eslintrc` FlatCompat setup.
- **Google Maps API key required.** The app requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`. Without a valid key, the map shows "Loading map..." and the places list is empty. The app still renders its layout/components correctly.
- **MSW (Mock Service Worker) and HTTPS.** MSW mocks the Google Places API but service workers cannot register over HTTPS with self-signed certificates (browser security restriction). MSW only activates when `NODE_ENV=development` AND the browser cookie `MSW_ENABLED=true` is set. To use MSW in a cloud environment, you would need to run the server on HTTP (remove `--experimental-https` from the dev script temporarily).
- **No `.env.example` file.** Create `.env.local` manually with `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key`.
- **No automated tests.** The project has no test framework or test files. Validation is limited to `npx tsc --noEmit` and `npm run build`.
- **Spin page requires places.** The `/spin` route redirects to `/` if no places are selected. Places require a working Google Maps API to populate.
