#!/bin/bash

# E2E Test Runner Script
# This script starts all required services and runs Cypress tests

set -e

echo "🚀 Starting E2E test environment..."
echo ""

# Check if Docker/infra is running
echo "1️⃣  Checking Docker infrastructure..."
if docker ps | grep -q postgres; then
  echo "   ✓ PostgreSQL running"
else
  echo "   ℹ️  Starting Docker infrastructure (optional, not required for current tests)..."
  # docker-compose -f docker-compose.infra.yml up -d
fi

# Start all services
echo ""
echo "2️⃣  Starting all services (backend + frontend)..."
cd "$(dirname "$0")/../.."

# Run in background
nohup pnpm dev > /tmp/dev.log 2>&1 &
DEV_PID=$!
echo "   Process ID: $DEV_PID"

# Wait for services to be ready
echo ""
echo "3️⃣  Waiting for services to start (30 seconds)..."
for i in {1..30}; do
  if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "   ✓ Frontend ready"
    break
  fi
  echo -n "."
  sleep 1
done

echo ""
echo "4️⃣  Running Cypress tests..."
cd apps/e2e

# Run tests based on argument
if [ "$1" == "open" ]; then
  echo "   Opening Cypress Test Runner..."
  npx cypress open
elif [ "$1" == "debug" ]; then
  echo "   Running with browser visible..."
  npx cypress run --headed --browser chrome
else
  echo "   Running headless..."
  npx cypress run
fi

# Cleanup
echo ""
echo "5️⃣  Cleaning up..."
kill $DEV_PID 2>/dev/null || true

echo "✅ E2E tests complete!"
