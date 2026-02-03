# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Train-React is a Progressive Web App for tracking SEPTA (Southeastern Pennsylvania Transportation Authority) regional rail status. It displays real-time train schedules between a user's home station and work station using the SEPTA Hackathon API.

## Development Commands

```bash
npm start       # Start development server with Tailwind CSS watch (serves at localhost:3000)
npm test        # Run tests in interactive watch mode
npm run build   # Production build with CSS compilation
```

## Architecture

This is a single-file React application built with Create React App. All application logic lives in `src/App.js`:

- **App** - Main component managing state (line, stations) and cookie-based persistence
- **ConfigScreen** - Settings modal for selecting rail line and stations
- **TrainInfo** - Fetches and displays schedules from SEPTA API
- **Delay** - Visual delay indicator (green checkmark, red X, or delay minutes)

**Key data files:**
- `src/assets/lines.json` - SEPTA rail lines (13 lines)
- `src/assets/stations.json` - Station data with line associations

**External API:** `https://www3.septa.org/hackathon/NextToArrive/{origin}/{destination}/{count}` (JSONP)

## Tech Stack

- React 16.13.0 with hooks (useState)
- Tailwind CSS 1.2.0 for styling
- react-cookie for persisting user preferences
- jQuery for JSONP API requests
- react-js-pull-to-refresh for mobile refresh UX
