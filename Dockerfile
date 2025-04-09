FROM oven/bun:1 AS dependencies-env
COPY . /app

FROM dependencies-env AS development-dependencies-env
COPY ./package.json bun.lock /app/
WORKDIR /app
RUN bun i --frozen-lockfile

FROM dependencies-env AS production-dependencies-env
COPY ./package.json bun.lock /app/
WORKDIR /app
RUN bun i --production
RUN bunx prisma generate

FROM dependencies-env AS build-env
COPY ./package.json bun.lock /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN bun run build

# bun runtime crashes on production when running react@19
FROM node:23 AS runtime-env
WORKDIR /app
COPY --from=dependencies-env /app /app
COPY ./package.json bun.lock server/index.ts /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

EXPOSE 3000

ENV DATABASE_URL=file:/data/sqlite.db

RUN chmod +x /app/start.sh
ENTRYPOINT [ "/app/start.sh" ]