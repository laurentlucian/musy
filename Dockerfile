# base bun image
FROM oven/bun:1 AS base

# set for base and all layer that inherit from it
ENV NODE_ENV=production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

EXPOSE 3000

# Install all node_modules, including dev dependencies
FROM base AS deps

RUN mkdir /app
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Setup production node_modules
FROM base AS production-deps

RUN mkdir /app
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Build the app
FROM base AS build

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY prisma ./prisma

RUN ls -la prisma/
RUN cat prisma/schema.prisma
RUN echo $DATABASE_URL

RUN bunx prisma --version

RUN cat prisma/schema.prisma

RUN bunx prisma generate
COPY . .
RUN bun run build

# Finally, build the production image with minimal footprint
FROM base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT=3000
ENV NODE_ENV=production

# add shortcut for connecting to database CLI `fly ssh console -C database-cli`
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

COPY --from=build /app/build/server /app/build/server
COPY --from=build /app/build/client /app/build/client
COPY --from=build /app/package.json /app/package.json

COPY --from=build /app/start.sh /app/start.sh
COPY --from=build /app/prisma /app/prisma

RUN chmod +x /app/start.sh
ENTRYPOINT [ "/start.sh" ]
