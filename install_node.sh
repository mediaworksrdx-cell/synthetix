#!/usr/bin/env bash
set -e

echo "Installing NVM and Node.js in user-space..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20
nvm alias default 20

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

cd "$HOME/synthetix-site"
echo "Starting Next.js standalone server..."
pkill -f "node server.js" 2>/dev/null || true
sleep 1

PORT=3000 nohup node server.js > site.log 2>&1 &
sleep 3

ps aux | grep "node server.js" | grep -v grep || true
echo "Testing local endpoint on port 3000..."
curl -s -o /dev/null -w "HTTP Response Code: %{http_code}\n" http://127.0.0.1:3000/ || true
