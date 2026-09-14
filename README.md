<p align="center">
  <a href="https://musy.olaurent.com">
    <picture>
      <img src="public/logo/musy.png" height="128" alt="Musy" />
    </picture>
    <h1 align="center">Musy</h1>
  </a>
</p>

## Lint

Run `bun run lint` for Biome and `@shadcn/lint`, or `bun run lint:ui` for the latter alone. Oxlint hosts the plugin; its default rules are disabled so Biome keeps the existing lint policy.

No `@shadcn/lint` rules are enabled yet. Add chosen rules to `.oxlintrc.json` using the [available rules](https://github.com/shadcn-ui/lint#rules) and [configuration examples](https://github.com/shadcn-ui/lint/blob/main/docs/design-systems.md). Components and theme are discovered through `components.json`; design guidance lives in `DESIGN.md`.

## Profile badges

Embed `/badges/hours.svg?user=<id-or-username>`, `/badges/genres.svg?user=<id-or-username>`, or `/badges/repeat.svg?user=<id-or-username>` from `https://musy.olaurent.com`. Each badge requires one user ID or username; usernames are case-insensitive. Missing or invalid selectors return 400, unknown profiles return 404. Successful images cache for five minutes.

Link listening hours to `/profile/<id-or-username>` and the repeat badge to `/profile/<id-or-username>/repeating`.
