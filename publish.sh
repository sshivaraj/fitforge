#!/bin/sh
# Publish FitForge to GitHub Pages (free hosting) so it can be added to the iPhone Home Screen.
# First run creates a public repo and turns on Pages; later runs just push updates.
set -e
cd "$(dirname "$0")"
REPO="${1:-fitforge}"
git add -A
git commit -qm "Update FitForge" || true
if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create "$REPO" --public --source . --push
  gh api -X POST "repos/{owner}/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null
else
  git push -q
fi
echo "Live in about a minute at: https://$(gh api user --jq .login).github.io/$REPO/"
