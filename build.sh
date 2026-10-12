#!/usr/bin/env bash
# Assembles the site into dist/ for Netlify.
# Only the files visitors need are published; project source stays out.
set -euo pipefail

rm -rf dist
mkdir -p dist

# Terminal site
cp index.html style.css script.js desktop.js dist/
cp -r assets games dist/

# Stock Exchange (git submodule) -> /stock
git submodule update --init --recursive 2>/dev/null || true
(cd projects/stock-exchange && npm ci && npm run build)
mkdir -p dist/stock
cp -r projects/stock-exchange/frontend/dist/. dist/stock/
