# TopTenly — Full Project (v0.3) — Comments & Favorites included

This package contains a Next.js project (TypeScript-ready) with Supabase for storage and OpenAI bootstrap for missing lists.
Features included:
- Search + OpenAI bootstrap lists
- Vote system (3/2/1 weights, max 3 votes per user per list)
- Comments (threaded) on lists and items
- Favorites (save lists)
- Profile page, sharing, favorites page
- Tailwind, Vazirmatn font, dark mode toggle, SWR caching for popular/trending

See `.env.example`, `schema.sql`, and the "Deploy & Run" section below.

---
## Quick Run (local)
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill values.
3. In Supabase SQL Editor run `schema.sql`.
4. `npm run dev`
5. Open http://localhost:3000

## Notes
- Set `SUPABASE_SERVICE_ROLE_KEY` in server envs only.
- Run `schema.sql` to create tables and functions.
