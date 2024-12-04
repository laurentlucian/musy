#!/bin/sh
set -ex

until bunx prisma migrate deploy; do
  echo "migrating..."
  sleep 5
done

exec bun run start