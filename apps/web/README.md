# Kaarvan — Frontend

React 19 + TypeScript + Vite + Tailwind CSS.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Type-check + production build |
| `npm run check-types` | TypeScript type-check |
| `npm run lint` | ESLint |

## Environment

Create `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

## Structure

```
src/
├── components/   # UI components (Navbar, OpportunityCard, FilterBar, forms)
├── context/      # AuthContext (JWT, Google OAuth)
├── lib/          # Axios API client, types
└── pages/        # Route pages (10 pages)
```
