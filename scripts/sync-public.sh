#!/bin/bash
# After scripts/prerender.mjs writes per-route HTML to dist/<route>/index.html,
# copy those files into source public/<route>/index.html so they are committed
# to git and Vercel serves them as static assets on next deploy.
#
# Vercel's build container cannot run Puppeteer, so prerendering must happen
# locally before push. This script does that step.
#
# Usage:
#   npm run prerender:local
#
# Then `git add public/ && git commit && git push` to deploy the snapshot.

set -u

DIST=dist
PUBLIC=public

# Routes that get prerendered. Skip the root because public/index.html would
# conflict with Vite's entry template. The root page already has correct
# generic SACVPN title/h1/meta via the template.
ROUTES=(
  about
  blog
  compare
  contact
  download
  faq
  gaming
  industries
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
  if [ -d "$DIST/$r" ]; then
    rm -rf "$PUBLIC/$r"
    mkdir -p "$PUBLIC/$r"
    cp -r "$DIST/$r/." "$PUBLIC/$r/"
    count=$((count + 1))
  fi
done

echo "sync-public.sh: copied $count prerendered route dirs from $DIST to $PUBLIC"
