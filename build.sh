#!/usr/bin/env bash
set -euo pipefail

output="${1:-dist}"
mkdir -p "$output"

# Keep the mirror's relative URLs while providing the root-relative asset paths
# used by the saved invitation page, without relying on symlink deployment.
cp backblue.gif fade.gif "$output/"
cp -R chungdoi.com cdn.chungdoi.com local "$output/"
cp chungdoi.com/i/hongminh-khanhlinhbaf7.html "$output/index.html"
# Use Netlify's public site URL for share previews, while keeping image loads local.
if [[ "${URL:-}" =~ ^https?://[a-zA-Z0-9.-]+(:[0-9]+)?/?$ ]]; then
  site_origin="${URL%/}"
  sed -i "s|content=\"/cdn.chungdoi.com/uploads/4fc1d983-574d-41fa-8665-38e071d95976.jpg\"|content=\"${site_origin}/cdn.chungdoi.com/uploads/4fc1d983-574d-41fa-8665-38e071d95976.jpg\"|g; s|content=\"https://chungdoi.com/i/hongminh-khanhlinh\"|content=\"${site_origin}/\"|g" "$output/index.html"
fi
cp -R admin "$output/"
cp -R chungdoi.com/_next chungdoi.com/fonts chungdoi.com/images "$output/"
cp chungdoi.com/manifest5e1f.json "$output/manifest.json"
cp chungdoi.com/favicon.ico chungdoi.com/*-v2.png "$output/"
