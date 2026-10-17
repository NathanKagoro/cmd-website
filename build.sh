#!/usr/bin/env bash
# Assembles the site into dist/ for Netlify.
# Only the files visitors need are published; project source stays out.
set -euo pipefail

# Make sure submodules (games/2048, projects/stock-exchange) are checked out.
git submodule update --init --recursive 2>/dev/null || true

rm -rf dist
mkdir -p dist

# Terminal site
cp index.html style.css script.js desktop.js dist/
cp -r assets games dist/
# Submodules leave a .git pointer file and their tests behind; visitors need neither.
find dist -name .git -prune -exec rm -rf {} +
rm -rf dist/games/2048/tests dist/games/2048/.github

# Stock Exchange (git submodule) -> /stock
(cd projects/stock-exchange && npm ci && npm run build)
mkdir -p dist/stock
cp -r projects/stock-exchange/frontend/dist/. dist/stock/
