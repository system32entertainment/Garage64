#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting backend..."
cd "$ROOT/backend"
if [ ! -d venv ]; then
  echo "Creating Python venv..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python3 manage.py migrate
python3 manage.py runserver &
BACKEND_PID=$!

echo "Starting frontend..."
cd "$ROOT/frontend"
if [ ! -d node_modules ]; then
  echo "Installing npm dependencies..."
  npm install
fi
npm run dev &
FRONTEND_PID=$!

echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
