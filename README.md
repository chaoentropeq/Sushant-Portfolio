# Sushant Shah Kanu — Portfolio

A personal portfolio site that reacts to the time of day and (real) local
weather — the color palette, sky, and ambient effects on the home page
shift between morning/afternoon/evening/night and clear/cloudy/rain/snow/fog/heat,
using live Open‑Meteo data with manual overrides available.

**Live site:** https://chaoentropeq.github.io/Sushant-Portfolio/

## Stack

- **React 19** + **TypeScript**, built with **Vite**
- **Tailwind CSS v4**
- **Framer Motion** for animation
- **Matter.js** for the physics-driven falling skill icons
- No backend — all content is static data in `src/data.ts`

## Features

- **Home** — a weather/time-reactive bento layout with a canvas-rendered
  sky (sun/moon, clouds, rain, snow, thunder, fog) and a physics-based pile
  of falling skill icons.
- **Journey** — education, work, and a career break presented as a single
  reverse-chronological timeline.
- **Projects** — two purpose-built responsive mechanics for the same data:
  - **Wide, tall screens**: a scroll-jacked stack of cards, each peeking a
    sliver above the next as you scroll.
  - **Phones and short/landscape tablets**: an intro screen with a fanned
    card deck that grows into a full-screen swipe carousel between
    projects.
- **Skills**, **Writing**, **Certifications**, **Contact** — supporting
  pages, all built from the same data source.

All fluid typography uses `clamp()` (rem + vw) for headings only; buttons,
badges, and other micro-UI stay at fixed rem sizes. `box-sizing: border-box`
is applied globally so layouts stay contained across arbitrary viewport
sizes.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check (tsc) + production build to dist/
npm run preview   # preview the production build locally
npm run lint       # oxlint
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
site and publishes `dist/` to GitHub Pages automatically — no manual deploy
step. `vite.config.ts` sets `base: "/Sushant-Portfolio/"` to match the
Pages URL; routing is hash-based (`#/projects`, `#/journey`, …), so it
works on GitHub Pages with no server-side rewrites needed.

## Project structure

```
src/
  components/   Shared UI — nav dock, settings panel, sky canvas, intro, etc.
  pages/        One file per route (Home, Journey, Projects, Skills, …)
  hooks/        usePortfolio — time/weather state and hash-based routing
  data.ts       All content: journey, projects, skills, contacts
  theme.ts      Time/weather → color token computation, route list
```
