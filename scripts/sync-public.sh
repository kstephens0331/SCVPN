#!/bin/bash
# After scripts/prerender.mjs writes per-route HTML to dist/<route>/index.html
# (and the root snapshot to dist/_prerendered_root.html), copy those files into
# source public/ so they get committed to git and Vercel serves them as static
# assets on next deploy.
#
# Vercel's build container cannot run Puppeteer, so prerendering must happen
# locally before push. This script promotes the local artifacts.
#
# Usage:
#   npm run prerender:local
#
# Then `git add public/ && git commit && git push` to deploy the snapshot.
#
# The committed HTML files contain placeholder strings (__VITE_BUNDLE_JS__ /
# __VITE_BUNDLE_CSS__) where the bundle paths would normally be. The Vite
# plugin in vite.config.js substitutes the current build's hashes at every
# closeBundle, so the snapshot stays deployment-agnostic across Windows local
# and Vercel Linux builds (which produce different hashes for identical source).

set -u

DIST=dist
PUBLIC=public

# Routes that get prerendered as subdir/index.html.
ROUTES=(
  about
  blog
  compare
  contact
  download
  faq
  gaming
  industries/finance
  industries/healthcare
  industries/legal
  industries/remote-teams
  industries/small-business
  login
  partners
  personal
  pricing
  privacy
  terms
  tools
)

count=0
for r in "${ROUTES[@]}"; do
  src="$DIST/$r/index.html"
  if [ -f "$src" ]; then
    rm -rf "$PUBLIC/$r"
    mkdir -p "$PUBLIC/$r"
    cp "$src" "$PUBLIC/$r/index.html"
    count=$((count + 1))
  fi
done

# Promote the root prerender snapshot. Vite's build will OVERWRITE its own
# dist/index.html with this content via the rewrite-prerendered-assets plugin.
if [ -f "$DIST/_prerendered_root.html" ]; then
  cp "$DIST/_prerendered_root.html" "$PUBLIC/_prerendered_root.html"
  echo "sync-public.sh: copied root snapshot ($(wc -c < "$PUBLIC/_prerendered_root.html") bytes)"
fi

echo "sync-public.sh: copied $count prerendered route files from $DIST to $PUBLIC"
