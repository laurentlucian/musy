FROM oven/bun AS dependencies-env

# set ulimit for memory locking
# RUN ulimit -l unlimited

COPY . /app

FROM dependencies-env AS development-dependencies-env
COPY ./package.json bun.lock /app/
WORKDIR /app
RUN bun i --frozen-lockfile

FROM dependencies-env AS production-dependencies-env
COPY ./package.json bun.lock /app/
WORKDIR /app

# # install openssl for prisma
RUN apt-get update -y && apt-get install -y openssl

RUN bun i --production

FROM dependencies-env AS build-env
COPY ./package.json bun.lock /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN bun prisma generate
RUN bun run build

FROM oven/bun AS runtime-env
WORKDIR /app

# copy openssl to runtime stage
COPY --from=production-dependencies-env /usr/lib /usr/lib
COPY --from=production-dependencies-env /usr/bin/openssl /usr/bin/
COPY --from=production-dependencies-env /etc/ssl /etc/ssl

COPY --from=dependencies-env /app /app
COPY ./package.json bun.lock server/index.ts /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/lib/services/db/generated.server /app/lib/services/db/generated.server

WORKDIR /app

EXPOSE 3000

ENV DATABASE_URL=file:/data/sqlite.db

CMD ["bun", "start"]