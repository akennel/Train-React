# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Train-React is a Progressive Web App for tracking SEPTA (Southeastern Pennsylvania Transportation Authority) regional rail status. It displays real-time train schedules between a user's home station and work station using the SEPTA API, proxied through Netlify Functions.

## Development Commands

```bash
npm start           # Start Vite dev server (localhost:5173)
netlify dev         # Start full dev environment with Netlify Functions (localhost:8888) — use this for local development
npm run build       # Production build
npm run preview     # Preview production build locally
```

> **Note:** The app calls `/.netlify/functions/*` endpoints, so `netlify dev` is required for local full-stack development. `npm start` alone will cause API calls to fail.

## Architecture

This is a single-file React application. All application logic lives in `src/App.jsx`:

- **App** - Main component managing state (line, stations) and cookie-based persistence; uses `usePullToRefresh` hook
- **ConfigScreen** - Settings modal for selecting rail line and stations
- **TrainInfo** - Fetches and displays schedules via Netlify Function proxy (fetches train times and details in parallel)
- **TrainCars** - Visual indicator of train consist length (number of cars)
- **Delay** - Visual delay indicator (green checkmark, red X, or delay minutes)
- **usePullToRefresh** - Custom hook replacing react-js-pull-to-refresh; handles native touch events

**Key data files:**
- `src/assets/lines.json` - SEPTA rail lines (13 lines)
- `src/assets/stations.json` - Station data with line associations

**Netlify Functions (backend proxy):**
- `netlify/functions/get-train.js` — Proxies `NextToArrive` API: `GET /.netlify/functions/get-train?start=...&end=...`
- `netlify/functions/get-train-details.js` — Proxies `TrainView` API for consist data: `GET /.netlify/functions/get-train-details`

**External APIs (called server-side from Netlify Functions):**
- `https://www3.septa.org/api/NextToArrive/index.php?req1={origin}&req2={destination}&req3=2`
- `https://www3.septa.org/api/TrainView/index.php`

## Tech Stack

- React 18.3 with hooks (useState, useEffect, useRef)
- Vite 5 with @vitejs/plugin-react
- Tailwind CSS 3 for styling (compiled via PostCSS)
- react-cookie v6 for persisting user preferences
- Netlify Functions (`@netlify/functions`) as a serverless API proxy

## Deployment

Deployed on Netlify. Config in `netlify.toml`:
- Functions directory: `netlify/functions`
- Dev command: `npm start` targeting Vite on port 5173, served via Netlify dev on port 8888
