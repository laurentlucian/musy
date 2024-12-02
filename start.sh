#!/bin/sh
set -ex
bunx prisma migrate deploy
bun run start