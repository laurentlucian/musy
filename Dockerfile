# base node image
FROM node:20-bookworm-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV=production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

EXPOSE 8080

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /app
WORKDIR /app

COPY .yarn ./.yarn
COPY .yarnrc.yml package.json yarn.lock* ./
RUN yarn install && rm -rf ./.yarn/cache

# Setup production node_modules
FROM base as production-deps

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY .yarn ./.yarn
COPY .yarnrc.yml package.json yarn.lock* ./
RUN yarn plugin import workspace-tools
RUN yarn workspaces focus --production && rm -rf ./.yarn/cache

# Build the app
FROM base as build

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN yarn build && rm -rf ./.yarn

# Finally, build the production image with minimal footprint
FROM base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT=8080
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
ADD . .

ENTRYPOINT [ "/start.sh" ]
