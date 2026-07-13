# frontend_kuesioner

Frontend Kuesioner for Tendik and Dosen to vote service in Widya Mandala Catholic University.

A standalone React + TypeScript SPA (Vite) that lets Dosen/Tendik log in and fill out the periodic
evaluation questionnaire against the Simanja2 Laravel Sanctum API. See
[.ai/frontend/prd_kuesioner_frontend.md](.ai/frontend/prd_kuesioner_frontend.md) for the full spec.

## Stack

- React 19 + TypeScript + Vite
- TanStack Query (React Query) for API state
- React Router
- Tailwind CSS v3

## Development

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend
npm run dev
```

## Build

```bash
npm run build
```
