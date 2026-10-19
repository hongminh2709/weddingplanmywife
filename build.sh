#!/usr/bin/env bash
set -euo pipefail

output="${1:-dist}"
mkdir -p "$output"

# Keep the mirror's relative URLs while providing the root-relative asset paths
# used by the saved invitation page, without relying on symlink deployment.
cp index.html backblue.gif fade.gif "$output/"
cp -R chungdoi.com cdn.chungdoi.com local "$output/"
cp -R admin "$output/"
cp -R chungdoi.com/_next chungdoi.com/fonts chungdoi.com/images "$output/"
cp chungdoi.com/manifest5e1f.json "$output/manifest.json"
cp chungdoi.com/favicon.ico chungdoi.com/*-v2.png "$output/"
