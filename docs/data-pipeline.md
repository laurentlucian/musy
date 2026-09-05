# Listening data

`HistoryEvent` holds normalized imported listens; `RecentTracks` reconciles imports with API listening. Imported duration is measured, including zero. API duration is an estimate only when track duration is known; missing duration is counted separately. Imported catalog placeholders carry `metadataSource`; provider enrichment replaces that provenance.

Import identity uses account, track, timestamp, duration and platform. Display metadata, country and IP changes do not create another playback. Existing event IDs remain stable. Identical simultaneous records with the same identity cannot be distinguished without a provider event ID; different platforms remain separate. Raw source payloads retain the evidence for future normalization.

## Reads and refresh

- Explore reads `HistoryExploreSummary` plus 51 indexed events. SQLite triggers maintain totals/country/platform counts atomically on insert, update and deletion. Cursor navigation fetches songs without reloading the map. The country expression index covers older unnormalized values.
- `AnalyticsYear` marks changed years. Background jobs rebuild track and day/hour aggregates for one year in a D1 transaction. Distinct tracks/artists/albums are computed by identity across the selected period, never by adding daily distinct counts.
- `DashboardSnapshot` stores the final display result. Request reads inspect its source revision and return the last complete result with a pending indicator while refresh runs. Publication checks the source revision again, so an intervening write cannot publish stale data as current.
- Metadata and likes invalidate snapshots. Unchanged metadata updates do not. Cron recovers dirty years, missing/stale snapshots and failed legacy Stats persistence. Legacy Stats retains entity IDs rather than resolving names to arbitrary catalog entries.

## Archives

The private `musy-history-archives` R2 bucket stores account-scoped, checksum-addressed JSON. New imports upload and read back the object before committing D1 references. Legacy backfill uses the existing delivery queue and copies 500 records at a time, verifies SHA-256, and atomically replaces inline JSON with object/checksum/offset references. Updates require matching original row contents. The primary-key query-plan regression test prevents a user-wide scan during this update.

R2 and D1 are not one transaction: an interrupted import can leave an unreferenced object, but a failed verification never removes inline source data. Retrying is safe. Keep objects private and do not apply a generic bucket expiry policy to referenced archives.

Account deletion is an atomic D1 batch with a durable archive-cleanup outbox. Cleanup waits 24 hours, retries failures and skips a recreated account ID. No automatic inactive-account deletion runs. The delay mitigates in-flight uploads; it is not a distributed lock against account recreation. See `data-cleanup-audit.md` for remaining cleanup candidates.

## Maintenance

Run from this repository using the configured Wrangler account. These scripts use remote D1/R2 bindings and print aggregate progress, not listening records. Node executes the bundled scripts because Bun's remote binding proxy did not make progress in verification.

```sh
CI=true bun run db:migrate
bun run db:analytics
bun run db:dashboards
bun run db:archive
bun run db:verify
```

Run analytics before dashboards. Cron automatically recovers remaining legacy archives and the queue continues chunk by chunk; the CLI is an optional maintenance path. Archive backfill is resumable and retries a failed chunk five times; after a terminal error, resolve the cause and rerun. `db:verify` compares source totals to summaries and prints outstanding archives and read costs. A cleared JSON field does not imply D1's allocated database file immediately shrinks.

Watch pending `AnalyticsYear` revisions, snapshot age, queue failures, `ArchiveCleanup`, unarchived counts and D1 database size. Avoid expanding the number of aggregate dimensions without a measured query need. The paid D1 per-database capacity remains 10 GB; archive separation reduces growth but does not remove that ceiling.

## Verification on 2026-09-05

216,774 imported events; 541,252 reconciled/API events at audit time. All source/track/day reconciliation checks returned zero mismatches. Explore's initial queries read 297 rows (previously approximately 1.3 million); sampled SQL durations totalled 1.14 ms. The final dashboard snapshot read took 0.43 ms and 61 row reads. These are SQL measurements, not browser latency guarantees.

Browser fixture checks exercised the actual Explore component and stylesheet: country filtering, both pagination directions, browser history and unchanged summary loading. Database tests separately exercise real SQLite migrations, retries, rollback, account isolation, tied timestamps, snapshot invalidation and archive verification.
