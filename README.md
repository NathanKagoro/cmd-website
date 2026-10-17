# CMD Website

Nathan Kagoro's portfolio at [nathankagoro.com](https://nathankagoro.com). It is a fake command prompt: you type commands to find the projects, resume and games. It also has:

- a desktop mode you reach from the terminal;
- four small games;
- links out to each project, most on GitHub Pages, with the Stock Exchange built into `/stock`.

It deploys to Netlify, which also handles the redirects.

## What The Website Does

### 1) Terminal (main entry)

The homepage is a command prompt. Visitors are meant to explore it, so the page only shows one hint, `Type help to get started.`, and `help` lists the rest.

Commands:

| Command | What it does |
|---|---|
| `help` (also `commands`, `ls`, `?`) | List commands |
| `about` | About Nathan |
| `projects` / `projects <alias>` | List projects or open one |
| any project name (`mmm`, `swahili`, `mathpath` and so on) | Open that project directly |
| `resume` | View the CV, with a Download PDF link (phones get the link instead of an embedded PDF) |
| `links` | LinkedIn and GitHub |
| `play <game>` (also `games`) | `tictactoe`, `rps`, `hangman`, `2048` |
| `datetime` | Current date and time |
| `sound on` / `sound off` | Typing beeps; off by default, remembered in localStorage |
| `clear` | Clear the screen |
| `update` | Switch into desktop mode |

Behavior includes:

- No command buttons under the prompt. The only one is the word `help` in the hint, which can be tapped so phone visitors can start. Command names in the `help` and `projects` output can be clicked or tapped too, and tapping anywhere else focuses the prompt.
- Tab completes commands and `projects` / `play` / `sound` arguments; unknown commands suggest the closest match.
- Command history with the up/down arrows.
- A short typed intro that any key or tap skips (printed instantly with `prefers-reduced-motion`).
- A deliberate ~500 ms "Loading" pause before each command.
- Overlays (resume, games) are modal dialogs: Escape, the X button or the backdrop close them, and focus returns to the prompt.
- A plain-HTML "quick view" (name, role, projects, resume, links) in `index.html` for search engines, no-JS visitors and screen readers. It is hidden once the terminal starts and isn't advertised anywhere in the UI. A skip link that only appears on keyboard focus opens it, and so does a direct link to `/#quick-view`.
- Responsive layout for phones down to 360px wide.

### 2) Desktop Mode

Desktop mode sits on top of the terminal and has icons for:

- Resume
- Projects folder (launches subprojects)
- Games
- CMD return icon (returns to terminal interaction)

Desktop mode lives at `/windows` and the terminal at `/`, so the browser's back and forward buttons switch between them.

### 3) Projects

Each project lives in its own repository; nothing is copied into this repo. The list lives in `PROJECTS` in `script.js` (alias, name, category, one-line blurb, URL, repo). Every alias also works as a command on its own, and `projects` lists them by category.

GitHub Pages projects are served at `https://nathankagoro.github.io/<repo>/`. A project's link only works once Pages is switched on for its repo and its improvements are merged into `main`.

| Command | Project | Repository | Hosted on |
|---|---|---|---|
| `damana` | Damana Consult | [damana-consult-website](https://github.com/NathanKagoro/damana-consult-website) | [damanaconsultant.com](https://damanaconsultant.com/) (live client site) |
| `diplotech` | Diplotech Solutions | [diplotech-website](https://github.com/NathanKagoro/diplotech-website) | GitHub Pages |
| `laki` | Laki Associates | [Laki-associates-demo-website](https://github.com/NathanKagoro/Laki-associates-demo-website) | GitHub Pages |
| `exortium` | Exortium | [exortium-website](https://github.com/NathanKagoro/exortium-website) | GitHub Pages |
| `yola` | YOLA Home Fragrances | [yola-website](https://github.com/NathanKagoro/yola-website) | GitHub Pages (`gh-pages` branch) |
| `swahili` | Swahili Voice IDE | [Swahili-ide](https://github.com/NathanKagoro/Swahili-ide) | GitHub Pages |
| `mathpath` | MathPath | [mathpath-prototype](https://github.com/NathanKagoro/mathpath-prototype) | GitHub Pages |
| `yuge` | YugeSavers | [yugesavers-prototype](https://github.com/NathanKagoro/yugesavers-prototype) | GitHub Pages |
| `volley` | Volleyball Tracker | [Volleyball-game-tracker](https://github.com/NathanKagoro/Volleyball-game-tracker) | GitHub Pages |
| `stock` | Stock Exchange | [stock-exchange-simulator](https://github.com/NathanKagoro/stock-exchange-simulator) | this site, at `/stock` (git submodule) |
| `mmm` | MMM Dashboard | [MMM-Dashboard](https://github.com/NathanKagoro/MMM-Dashboard) | GitHub Pages |
| `traffic` | Dar Traffic Monitoring | [Dar-Traffic-Monitoring](https://github.com/NathanKagoro/Dar-Traffic-Monitoring) | GitHub Pages |
| `news` | News Detection | [news-detection](https://github.com/NathanKagoro/news-detection) | GitHub Pages |

Static projects are on GitHub Pages because it is free. Netlify's credit plan charges per production deploy and per GB served. Old `/laki` and `/mmm` links redirect there.

The Stock Exchange is included as a **git submodule** at `projects/stock-exchange` and built into `/stock`. It runs entirely in the browser: its build step turns the price CSV into compact yearly data files, so there is no server or Netlify Function.

### 4) Games

Games start from the `play` command or from desktop mode:

- Tic Tac Toe
- Rock Paper Scissors
- Hangman
- 2048

2048 lives in its own repo ([NathanKagoro/2048](https://github.com/NathanKagoro/2048)), included here as a submodule. It plays inside the overlay, and `/2048` opens its standalone page.

## Repository Structure

- `index.html`, `style.css`, `script.js`, `desktop.js`: terminal and desktop UI.
- `assets/`: icons, background, resume, favicon and the `og-image.png` social preview.
- `games/`: game scripts. `games/2048/` is a git submodule of [2048](https://github.com/NathanKagoro/2048).
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
git submodule update --remote projects/stock-exchange   # or games/2048
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
