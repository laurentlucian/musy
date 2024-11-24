import { useNavigate, useParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/server-runtime";

import { ArrowLeft2 } from "iconsax-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";

import Track from "~/components/tiles/playlists/Track";
import useIsMobile from "~/hooks/useIsMobile";
import type { Track as Tracks } from "~/lib/types/types";
import { decodeHtmlEntity, getCacheControl } from "~/lib/utils";
import { getSpotifyClient } from "~/services/spotify.server";

const PlaylistOutlet = () => {
  const { playlist } = useTypedLoaderData<typeof loader>();
  const { id } = useParams();
  const navigate = useNavigate();
  const isSmallScreen = useIsMobile();

  const tracks: Tracks[] = playlist.tracks.items.map((track) => {
    return {
      albumName: track.track?.album.name ?? "No Tracks",
      albumUri: track.track?.album.uri ?? "",
      artist: track.track?.artists[0].name ?? "",
      artistUri: track.track?.artists[0].uri ?? "",
      duration: track.track?.duration_ms ?? 0,
      explicit: track.track?.explicit ?? false,
      id: track.track?.id ?? "",
      image: track.track?.album.images[0]?.url ?? "",
      link: track.track?.external_urls.spotify ?? "",
      name: track.track?.name ?? "",
      preview_url: track.track?.preview_url ?? "",
      uri: track.track?.uri ?? "",
    };
  });

  return (
    <div className="relative z-5">
      <div className="flex">
        <button
          aria-label="Back"
          className="bg-transparent"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft2 />
        </button>
        <img
          src={playlist.images[0]?.url}
          className="h-24 w-24 md:h-36 md:w-36"
          alt="playlist"
        />
        <div>
          <h2 className="text-sm">{playlist.name}</h2>
          {playlist.description && (
            <p className="line-clamp-2 text-xs opacity-80">
              {decodeHtmlEntity(playlist.description)}
            </p>
          )}
        </div>
      </div>
      <div className="m-0 p-0">
        <table className="m-0 w-full p-0">
          <thead>
            <tr>
              <th>Title</th>
              {!isSmallScreen && (
                <>
                  <th>Album</th>
                  <th>Date added</th>
                  <th>Song Length</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="stack-3 relative z-5">
            {playlist.tracks.items.map(({ added_at, track }, index) => {
              if (!track) return null;

              return (
                <Track
                  key={track.id}
                  track={track}
                  addedAt={added_at}
                  userId={id ?? ""}
                  tracks={tracks}
                  index={index}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  invariant(id, "Missing params id");
  const playlistId = params.playlist;
  invariant(playlistId, "Missing params playlistId");

  const { spotify } = await getSpotifyClient(id).catch(async (e) => {
    if (e instanceof Error && e.message.includes("revoked")) {
      throw new Response("User Access Revoked", { status: 401 });
    }
    throw new Response("Failed to load Spotify", { status: 500 });
  });
  if (!spotify) {
    throw new Response("Failed to load Spotify [2]", { status: 500 });
  }

  const { body: playlist } = await spotify.getPlaylist(playlistId);

  return typedjson(
    { playlist },
    {
      headers: {
        ...getCacheControl(60 * 24),
      },
    },
  );
};

export { ErrorBoundary } from "~/components/error/ErrorBoundary";
export default PlaylistOutlet;
