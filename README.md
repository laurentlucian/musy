## Musy
Spotify hub for friends.



## 🏗

```env
# .env
DATABASE_URL=""
SESSION_SECRET=""
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
SPOTIFY_CALLBACK_URL=""
```

### Production DB Cli

The sqlite database lives at `/data/sqlite.db`. Connect to it by running `fly ssh console -C database-cli`.
