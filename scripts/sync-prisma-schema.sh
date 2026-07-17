#!/usr/bin/env bash
# Sync web Prisma schema → backend, preserving backend client output path.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_SCHEMA="$ROOT/web/prisma/schema.prisma"
BACKEND_SCHEMA="$ROOT/backend/prisma/schema.prisma"

cp "$WEB_SCHEMA" "$BACKEND_SCHEMA"

# Backend generates into src/generated/prisma (web uses lib/generated/prisma).
perl -i -pe 's|output\s*=\s*"\.\./lib/generated/prisma"|output   = "../src/generated/prisma"|' "$BACKEND_SCHEMA"

cd "$ROOT/backend"
npx prisma generate

echo "[sync] Backend schema synced + Prisma client regenerated."
