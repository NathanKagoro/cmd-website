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

Commands:

| Command | What it does |
|---|---|
| `help` (also `commands`, `ls`, `?`) | List commands |
| `about` | About Nathan |
| `projects` / `projects <alias>` | List projects or open one |
| `laki`, `mmm`, `stock` | Open a project directly |
| `resume` | View the CV, with a Download PDF link (phones get the link instead of an embedded PDF) |
| `links` | LinkedIn and GitHub |
| `play <game>` (also `games`) | `tictactoe`, `rps`, `hangman`, `2048` |
| `datetime` | Current date and time |
| `sound on` / `sound off` | Typing beeps; off by default, remembered in localStorage |
| `clear` | Clear the screen |
| `update` | Switch into desktop mode |

Behavior includes:

- Command chips under the prompt (about, projects, resume, games, links) that run commands through the normal path, so tapping works on phones.
- Tab completes commands and `projects` / `play` / `sound` arguments; unknown commands suggest the closest match.
- Command history with the up/down arrows.
- A short typed intro that any key or tap skips (printed instantly with `prefers-reduced-motion`).
- A deliberate ~500 ms "Loading" pause before each command.
- Overlays (resume, games) are modal dialogs: Escape, the X button or the backdrop close them, and focus returns to the prompt.
- A plain-HTML "quick view" (name, role, projects, resume, links) in `index.html` for search engines, no-JS visitors and screen readers. It is hidden once the terminal starts; the "Skip the terminal" link and the `quick view` chip show it.
- Responsive layout for phones down to 360px wide.

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

The Stock Exchange is included as a **git submodule** at `projects/stock-exchange` and built into `/stock`. It runs entirely in the browser: its build step turns the price CSV into compact yearly data files, so there is no server or Netlify Function.

### 4) Games

Games are available via command and desktop launch:

- Tic Tac Toe
- Rock Paper Scissors
- Hangman
- 2048

The 2048 experience is routed and organized with shared and game-specific assets under the games tree.

## Repository Structure

- `index.html`, `style.css`, `script.js`, `desktop.js`: terminal and desktop UI.
- `assets/`: icons, background, resume, favicon and the `og-image.png` social preview.
- `games/`: game scripts and the 2048 pages.
- `projects/stock-exchange/`: git submodule of [stock-exchange-simulator](https://github.com/NathanKagoro/stock-exchange-simulator).
- `build.sh`: assembles only the files visitors need into `dist/`, which is what Netlify publishes.
- `netlify.toml`: build and redirect configuration.

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

Redirects only run on Netlify. Use `netlify dev` to test those locally.

## Maintenance Notes

- Keep line endings for deployment config and shell scripts as LF.
- Keep command aliases (`laki`, `mmm`, `stock`) stable.
