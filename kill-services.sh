#!/usr/bin/env bash
set -euo pipefail

APP_PORTS="3000 4000 4001 4002 4003 4004"

collect_listener_pids() {
  local port="$1"
  local pids_lsof pids_ss

  pids_lsof="$(lsof -t -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  pids_ss="$(
    ss -ltnp "( sport = :$port )" 2>/dev/null \
      | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' \
      || true
  )"

  printf "%s\n%s\n" "$pids_lsof" "$pids_ss" \
    | awk 'NF { print }' \
    | sort -u
}

kill_pid_and_group() {
  local sig="$1"
  local pid="$2"

  if kill -0 "$pid" 2>/dev/null; then
    kill "-$sig" "$pid" 2>/dev/null || true
  fi

  local pgid
  pgid="$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ')"
  if [[ -n "$pgid" ]]; then
    kill "-$sig" "-$pgid" 2>/dev/null || true
  fi
}

echo "== PIDs by service ports =="
for p in $APP_PORTS; do
  pids="$(collect_listener_pids "$p" | xargs)"
  echo "port $p -> ${pids:-none}"
done

echo

echo "== Stopping app services (SIGTERM) =="
for p in $APP_PORTS; do
  for pid in $(collect_listener_pids "$p"); do
    echo "kill -15 $pid (port $p)"
    kill_pid_and_group TERM "$pid"
  done
done

sleep 2

echo

echo "== Force stopping remaining app services (SIGKILL) =="
for p in $APP_PORTS; do
  for pid in $(collect_listener_pids "$p"); do
    echo "kill -9 $pid (port $p)"
    kill_pid_and_group KILL "$pid"
  done
done

echo
echo "== Cleaning known dev process patterns =="
pkill -f "turbo run dev" 2>/dev/null || true
pkill -f "nest start --watch" 2>/dev/null || true
pkill -f "node .*dist/main" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "pnpm run dev" 2>/dev/null || true

sleep 1

echo

echo "== Remaining listeners on service ports =="
for p in $APP_PORTS; do
  pids="$(collect_listener_pids "$p" | xargs)"
  echo "port $p -> ${pids:-none}"
done

echo
echo "Done."
