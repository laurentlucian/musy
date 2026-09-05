# Database cleanup audit — 2026-09-05

Read-only production D1 queries through Wrangler. No accounts or candidate records deleted. Measurements occurred while performance migrations were being deployed.

## Accounts

6 users, all with active Spotify providers. 0 revoked providers, providerless users, orphan profiles, orphan Sync rows, or foreign-key violations. 4 users have no stored listen in the last 30 days; inactivity and sync failures do not establish that anyone left. There is no explicit departure or last-login signal. Do not delete these accounts automatically.

## Findings

| Area | Observation | Recommendation |
| --- | --- | --- |
| Shared catalog | 212,725 tracks; 122,109 lack relational references from RecentTracks, HistoryEvent, LikedTracks, PlaylistTrack, top-track links, Playback and QueueItem | Candidates only. Reconcile denormalized TopTracks.trackIds and Stats name lookups before bounded GC; recheck every user's references immediately before deletion. |
| Catalog dependencies | 129,361 albums; 59,028 artists | Measure unreferenced dependencies after track GC. Counts alone do not establish eligibility. |
| Sync state | 55 rows; 3 pending stats rows all have later success; 1 pending older than 7 days | Pending lookup now selects the latest timestamp, so old pending rows no longer shadow success. State in the primary key still permits historical states. Tiny storage impact, visible correctness impact. |
| Duplicate indexes | Track_id_key, Playlist_id_key, Top_userId_key, TopArtists_id_key, TopTracks_id_key duplicate primary-key uniqueness | Check query plans then drop explicit duplicates and schema declarations in a numbered migration. |
| Explore index | HistoryEvent_user_date_idx becomes a prefix of migration0016's cursor index | Verify plans then remove the shorter redundant index. |
| GeoIP | 0 rows; 1 queued HistoryGeoJob; no runtime processor/reader found | Unfinished feature, not storage bloat. Remove only if IP geolocation is intentionally abandoned. |
| Top snapshots | 3,164 track snapshots/157,950 links; 910 artist snapshots/41,235 links | Historical rankings require an explicit retention choice before pruning. |

Baseline: 216,774 HistoryEvents, 541,252 RecentTracks, 5,932 likes, 57 Stats, 149 playlists, 3 queue groups, 7 queue items. Database size was 724,463,616 bytes before migrations, 900,972,544 during deployment. Logical deletion does not guarantee proportional file-size reduction.

## Defects and implementation follow-up

The original deleteUser omitted restrictive Stats, QueueGroup and QueueItem dependencies after deleting providers/listens. All 6 users have Stats, so account deletion could fail after destructive partial changes. Sync has no FK and could remain. Replaced with one atomic D1 batch covering dependencies and a durable ArchiveCleanup outbox (migration0019). R2 cleanup waits 24 hours for in-flight work, retries failures, and skips accounts recreated under the same ID. Tests verify dependency deletion, other-user isolation, rollback, retry and recreation protection. No account deletion was executed. The delay mitigates in-flight writes; it is not a distributed lock against concurrent account recreation/imports. Background jobs must check account existence before writing.

Full liked sync stops after 10,000 records then treats unseen records as removed. Playlist sync has the same pattern at 2,500 playlists and 10,000 playlist tracks. Confirm complete pagination before deletion. Current maximum stored likes/user: 2,331; 0 users exceed 10,000, so this is not proof of existing loss.

getAllUsersId originally joined all active providers without selecting Spotify or deduplicating: 7 active providers across 6 users can schedule one user twice. Scheduling now restricts the provider type to Spotify.

## Recommended cleanup order

1. Correct lifecycle and incomplete-sync deletion defects.
2. Reconcile stale pending Sync state through correct transitions.
3. Remove verified redundant indexes.
4. Produce a dry-run catalog GC report, reconcile denormalized references, and approve concrete deletion targets separately.
5. Define explicit deletion intent and retention criteria before automated account cleanup. Token refresh timestamps are not login evidence.
