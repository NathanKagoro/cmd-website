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

### 3) Projects

Each project lives in its own repository. Nothing is copied into this repo.

| Command | Project | Repository | Hosted on |
|---|---|---|---|
| `laki` | Laki Associates Website | [Laki-associates-demo-website](https://github.com/NathanKagoro/Laki-associates-demo-website) | [GitHub Pages](https://nathankagoro.github.io/Laki-associates-demo-website/) |
| `mmm` | MMM Dashboard | [MMM-Dashboard](https://github.com/NathanKagoro/MMM-Dashboard) | [GitHub Pages](https://nathankagoro.github.io/MMM-Dashboard/) |
| `stock` | Stock Exchange | [stock-exchange-simulator](https://github.com/NathanKagoro/stock-exchange-simulator) | this site, at `/stock` (git submodule) |

Static projects are on GitHub Pages because it is free. Netlify's credit plan charges per production deploy and per GB served. Old `/laki` and `/mmm` links redirect there.

The Stock Exchange needs a backend, so it stays on Netlify. It is included as a **git submodule** at `projects/stock-exchange`, built into `/stock`, and its Express API runs as the `stock-api` Netlify Function behind `/api/*`.

### 4) Games

Games are available via command and desktop launch:

- Tic Tac Toe
- Rock Paper Scissors
- Hangman
- 2048

The 2048 experience is routed and organized with shared and game-specific assets under the games tree.

## Repository Structure

- `index.html`, `style.css`, `script.js`, `desktop.js`: terminal and desktop UI.
- `assets/`: icons, background, resume.
- `games/`: game scripts and the 2048 pages.
- `projects/stock-exchange/`: git submodule of [stock-exchange-simulator](https://github.com/NathanKagoro/stock-exchange-simulator).
- `netlify/functions/stock-api.js`: wraps the Stock backend as a Netlify Function.
- `build.sh`: assembles only the files visitors need into `dist/`, which is what Netlify publishes.
- `netlify.toml`: build, redirects and function configuration.

## Working With the Submodule

Clone with submodules:

```
git clone --recurse-submodules https://github.com/NathanKagoro/cmd-website
```

After pushing changes to stock-exchange-simulator, update the pinned version here:

```
git submodule update --remote projects/stock-exchange
git commit -am "Update stock-exchange"
```

Netlify checks out submodules of public repositories automatically.

## Deploying (and Saving Netlify Credits)

On Netlify's free credit plan, each production deploy costs 15 credits, out of 300 a month shared by every site on the team. Branch deploys and deploy previews are free.

The intended flow:

- Netlify's production branch is `release`.
- Day-to-day work goes to `main` (or feature branches), which get free branch-deploy previews.
- When a batch of changes is ready, merge `main` into `release`. That is one production deploy.

## Local Build

```
bash build.sh
npx serve dist
```

Redirects and the `/api` function only run on Netlify. Use `netlify dev` to test those locally.

## Maintenance Notes

- Keep line endings for deployment config and shell scripts as LF.
- Keep command aliases (`laki`, `mmm`, `stock`) stable.
