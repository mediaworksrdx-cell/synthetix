#!/bin/bash
cd /workspace/synthetix-site

# Restart Next.js standalone server
echo "Stopping any existing server on port 3000..."
fuser -k 3000/tcp 2>/dev/null || true
pkill -9 -f "server.js" 2>/dev/null || true
python3 -c "import os, signal; [os.kill(int(p), 9) for p in os.popen('ss -lptn sport = :3000 | grep -o pid=[0-9]* | cut -d= -f2').read().split()]" 2>/dev/null || true
sleep 1

# Start the standalone server in the background
echo "Starting Next.js server.js in background..."
PORT=3000 AARKAAI_BACKEND_URL=http://127.0.0.1:5000 HOSTNAME=0.0.0.0 nohup node server.js > site.log 2>&1 </dev/null &
echo "Next.js site started in background."
