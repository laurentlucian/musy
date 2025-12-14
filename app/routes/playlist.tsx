import { eq } from "drizzle-orm";
import { PlayIcon, RefreshCwIcon } from "lucide-react";
import { useEffect } from "react";
import {
  data,
  Form,
  href,
  Link,
  redirect,
  useFetcher,
  useNavigation,
} from "react-router";
import { toast } from "sonner";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import {
  generated,
  generatedPlaylist,
  profile,
  topSongsToTrack,
  track,
  user,
} from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { generatePlaylist } from "~/lib/services/sdk/helpers/ai.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";
import type { Route } from "./+types/playlist";

export async function loader({ params, context }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  if (!userId) return redirect("/settings");

  // Get the playlist with owner info
  const playlistData = await db
    .select({
      id: generatedPlaylist.id,
      mood: generatedPlaylist.mood,
      year: generatedPlaylist.year,
      familiar: generatedPlaylist.familiar,
      popular: generatedPlaylist.popular,
      createdAt: generatedPlaylist.createdAt,
      owner: {
        user: {
          id: user.id,
          name: profile.name,
        },
      },
    })
    .from(generatedPlaylist)
    .innerJoin(generated, eq(generatedPlaylist.ownerId, generated.id))
    .innerJoin(user, eq(generated.userId, user.id))
    .innerJoin(profile, eq(user.id, profile.id))
    .where(eq(generatedPlaylist.id, params.id))
    .limit(1);

  if (!playlistData.length) throw data("not found", { status: 404 });

  // Get the tracks for this playlist
  const playlistTracks = await db
    .select({ track })
    .from(topSongsToTrack)
    .innerJoin(track, eq(topSongsToTrack.b, track.id))
    .where(eq(topSongsToTrack.a, params.id));

  const playlist = {
    ...playlistData[0],
    tracks: playlistTracks.map((pt) => pt.track),
  };

  return { playlist, userId };
}

export default function Playlist({
  loaderData: { playlist, userId },
}: Route.ComponentProps) {
  const isOwner = userId === playlist.owner.user.id;

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="w-fit rounded-lg bg-card px-3 py-2 text-sm">
          {playlist.mood} {playlist.year}
        </p>
        <p className="text-muted-foreground text-sm">
          by{" "}
          <Link
            to={href("/profile/:userId?", { userId: playlist.owner.user.id })}
            className="hover:underline"
          >
            {playlist.owner.user.name}
          </Link>
        </p>
        <div className="flex flex-1 items-center justify-end gap-2">
          <PlayButton />
          {isOwner && <RefreshButton />}
        </div>
      </div>

      {playlist.tracks.map((track) => (
        <Track key={track.id} track={track} />
      ))}
    </div>
  );
}

function RefreshButton() {
  const navigation = useNavigation();
  const loading = navigation.formData?.get("intent") === "refresh";

  return (
    <Form method="post">
      <input type="hidden" value="refresh" name="intent" />
      <Button size="icon" disabled={loading}>
        {loading ? <Waver /> : <RefreshCwIcon />}
      </Button>
    </Form>
  );
}

function PlayButton() {
  const fetcher = useFetcher<typeof action>();
  const loading = fetcher.formData?.get("intent") === "play";

  useEffect(() => {
    if (fetcher.data) toast.error(fetcher.data);
  }, [fetcher.data]);

  return (
    <fetcher.Form method="post">
      <input type="hidden" value="play" name="intent" />
      <Button size="icon" disabled={loading}>
        {loading ? <Waver /> : <PlayIcon />}
      </Button>
    </fetcher.Form>
  );
}

export async function action({ params, request, context }: Route.ActionArgs) {
  const userId = context.get(userContext);
  if (!userId) return redirect("/settings");
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "refresh") {
    const playlist = await prisma.generatedPlaylist.findUnique({
      where: {
        id: params.id,
      },
    });
    if (!playlist) return "not found";

    await generatePlaylist(
      {
        mood: playlist.mood,
        year: playlist.year.toString(),
        familiar: playlist.familiar,
        popular: playlist.popular,
      },
      userId,
    );
  }

  if (intent === "play") {
    const spotify = await getSpotifyClient({ userId });
    const playing = await spotify.player.getPlaybackState();

    if (!playing) return "play a song first";

    const deviceId = playing.device?.id;
    if (typeof deviceId !== "string") {
      return "device not found";
    }

    const playlist = await prisma.generatedPlaylist.findUnique({
      include: {
        tracks: true,
      },
      where: {
        id: params.id,
      },
    });

    const trackUris = playlist?.tracks.map((track) => track.uri);

    if (!trackUris) return "no tracks in playlist";

    await spotify.player.startResumePlayback(deviceId, {
      uris: trackUris,
    });
  }
}
