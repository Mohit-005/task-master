# TaskMaster (Next.js)

A full‑stack TaskBoards app built with Next.js App Router, TypeScript, and Tailwind. Users can sign up, log in, create boards, add/update/delete tasks, and update their profile. The app supports AI tag suggestions (Gemini via Genkit) and uses JSON‑shaped storage with two modes:

- Local dev: JSON file on disk
- Vercel: Vercel KV (Upstash) for reliable, multi‑instance persistence

## Tech

- Next.js 15 (App Router, Route Handlers)
- TypeScript, Tailwind, Radix UI
- Auth: JWT in httpOnly cookie
- Storage: JSON (local file) or Vercel KV (production)
- Optional AI: Genkit + Gemini

## Getting started (local)

1. Requirements: Node 18+ (or 20+)
2. Install deps:
   ```bash
   npm ci
   ```
3. Create `.env.local`:
   ```env
   # Local dev can omit KV; JSON file will be used
   JWT_SECRET=replace-with-random-64-hex
   GEMINI_API_KEY=your-gemini-key
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:9002

Demo user: `user@example.com` / `password123`

## Project structure (high‑level)

- `src/app/api/*` — REST endpoints for auth, boards, tasks, profile
- `src/lib/auth.ts` — JWT issue/verify helpers
- `src/components/*` — UI components and dashboard views
- `src/ai/*` — optional AI tag suggestions with Genkit

## Scripts

- `npm run dev` — start dev server (port 9002)
- `npm run build` — build production bundle
- `npm start` — start production server locally
- `npm run typecheck` — type checking
- `npm run lint` — lint

## License

MIT
