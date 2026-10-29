#!/bin/zsh
# Deploy static game to Vercel. Procedure from memory (reference_all_credentials, feedback_vercel_cli_deploy_blocked_git_author):
#  - CLI inside a git repo whose HEAD author email isn't a Vercel team member HANGS SILENTLY -> deploy from a NON-GIT staging dir.
#  - non-interactive needs --scope henryps-projects-fc41e2ba ; --archive=tgz avoids the file-count cap.
set -euo pipefail
cd "$(dirname "$0")/.."
node tools/build_assets.mjs >/dev/null
S=$(mktemp -d /tmp/harrow-deploy.XXXXXX)
cp -R index.html src public "$S"/ ; mkdir -p "$S/.vercel"
[ -f .vercel-project.json ] && cp .vercel-project.json "$S/.vercel/project.json"
cat > "$S/vercel.json" <<'J'
{"cleanUrls":true,"headers":[{"source":"/(.*)","headers":[{"key":"Cache-Control","value":"public, max-age=0, must-revalidate"}]}]}
J
cd "$S"
OUT=$(perl -e 'alarm 300; exec @ARGV' vercel deploy --prod --yes --archive=tgz --scope henryps-projects-fc41e2ba --name harrow-settlers 2>&1 || true)
echo "$OUT" | tail -5
[ -f "$S/.vercel/project.json" ] && cp "$S/.vercel/project.json" "$OLDPWD/.vercel-project.json" || true
URL=$(echo "$OUT" | grep -Eo 'https://[a-z0-9.-]+\.vercel\.app' | tail -1)
echo "deployed: $URL"
