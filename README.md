# CMD Website

CMD Website is a portfolio-style single-site experience that combines:

- A terminal interface as the primary interaction layer.
- A desktop-style view accessible through the terminal flow.
- Embedded mini-games.
- Linked subprojects served under dedicated routes.

The repository is configured for Netlify-first deployment and routing.

## What The Website Does

### 1) Terminal Experience (Main Entry)

The homepage provides a command-line interface where users can run commands to navigate content and launch features.

Core command groups include:

- Profile and contact: resume, links, about.
- Projects: projects, laki, mmm, stock.
- Games: play tictactoe, play rps, play hangman, play 2048.
- Utility: datetime, clear, commands.
- View transition: update (switches into desktop mode).

Behavior includes:

- Command parsing with argument support.
- Command history via keyboard navigation.
- Lightweight loading and sound feedback.
- Overlay rendering for embedded content such as the resume and games.

### 2) Desktop Mode

The desktop mode is a separate UI layer rendered over the page. It provides icon-based access to:

- Resume
- Projects folder (launches subprojects)
- Games
- CMD return icon (returns to terminal interaction)

The terminal and desktop views are route-aware, using the browser history state for a windowed route and default terminal route.

### 3) Embedded Projects

The site routes to three main subprojects:

- /laki: Laki Associates Website
- /mmm: MMM Dashboard
- /stock: Stock Exchange app

These are integrated through terminal commands and desktop project links, not as isolated standalone pages.

### 4) Games

Games are available via command and desktop launch:

- Tic Tac Toe
- Rock Paper Scissors
- Hangman
- 2048

The 2048 experience is routed and organized with shared and game-specific assets under the games tree.

## Architecture Summary

### Root Site

- Static terminal shell (HTML/CSS/JS).
- Command router and feature wiring in the main script.
- Desktop UI implementation in a dedicated desktop module.

### Subproject: MMM Dashboard

- React app (CRA build output).
- Served under /mmm with SPA redirect behavior.
- Built and copied into site publish output during Netlify build.

### Subproject: Stock Exchange

- React (Vite) frontend served under /stock.
- Express backend wrapped as a Netlify Function.
- Frontend API calls in production are routed to /api/*.
- Historical CSV data is bundled for function access.

### Subproject: Laki Associates Website

- Static site copied into /laki during build.
- Supports both legacy and demo-site source folder naming.

## Netlify Deployment Model

This repository is intended to run under Netlify with:

- Redirect rules for:
	- /laki
	- /mmm and /mmm/*
	- /stock and /stock/*
	- /2048 and /2048/*
	- /api/* to the Stock API function
- Build steps that install and build each required subproject.
- Function bundling for the Stock backend.

Because of this setup, route behavior and API behavior depend on Netlify redirects/functions being active.

## Local Development Notes

Some parts work locally as static files, but full behavior requires Netlify-like routing.

Typical local differences:

- Directly opening nested files may bypass expected route redirects.
- Subpath SPAs may not resolve assets/routes correctly without proper hosting base path.
- Stock frontend API calls may fail unless backend routing is mirrored.

If you test locally, use a server setup that mimics:

- Rewrite/redirect behavior
- Subpath hosting
- /api forwarding to the function/backend

## Why Some Projects/Games May Not Run Correctly Outside Main Site

Certain components assume they are launched from the main shell context:

- Route entry points are controlled by command/desktop navigation.
- Overlays and command-driven interactions depend on the terminal app lifecycle.
- Subprojects rely on site-level redirects and hosted path conventions.

For this reason, running individual project files directly from arbitrary paths can produce missing assets, route errors, or API errors.

## Repository Structure (High-Level)

- Root shell: terminal UI, desktop UI, shared assets.
- games/: game scripts and 2048 route-specific pages/assets.
- projects/Laki Associates Website/: static project site.
- projects/MMM-Dashboard/: React dashboard project.
- projects/Stock Exchange/: frontend, backend, and data pipeline.
- netlify/: Netlify Functions entry points.
- netlify.toml: build, redirects, and function configuration.

## Recommended Validation Flow

1. Build subprojects through the configured build pipeline.
2. Verify routed entry points:
	 - /
	 - /laki
	 - /mmm
	 - /stock
	 - /2048
3. Verify Stock API-backed views load data through /api.
4. Verify terminal commands and desktop transitions still work.

## Maintenance Notes

- Keep line endings for deployment config and shell scripts as LF.
- Keep route aliases stable for command compatibility.
- When renaming source folders for embedded projects, preserve destination route naming.
