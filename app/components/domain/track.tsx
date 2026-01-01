import { Link, useNavigate } from "react-router";
import { cn } from "~/components/utils";
import type { Track as TrackType } from "~/lib.server/services/db";
import { Image } from "../ui/image";

function getArtistName(
  track: TrackType & { artists?: Array<{ artist?: { name?: string } }> },
): string {
  return track.artists?.[0]?.artist?.name || "Unknown";
}

function getArtistId(
  track: TrackType & { artists?: Array<{ artist?: { id?: string } }> },
): string | undefined {
  return track.artists?.[0]?.artist?.id;
}

function getArtistUri(
  track: TrackType & { artists?: Array<{ artist?: { uri?: string } }> },
): string {
  return track.artists?.[0]?.artist?.uri || track.uri;
}

export function Track(
  props: {
    track: TrackType & {
      artists?: Array<{
        artist?: { id?: string; name?: string; uri?: string };
      }>;
      likedAt?: string;
      playedAt?: string;
    };
    extraInfo?: React.ReactNode;
  } & React.ComponentProps<"a">,
) {
  const { track, extraInfo, ...rest } = props;
  return (
    <Link to={`/track/${track.id}`} viewTransition {...rest}>
      <div className="flex flex-1 gap-x-2 rounded-md bg-card px-3.5 py-3 transition-colors duration-150 hover:bg-accent">
        <TrackImage
          id={track.id}
          src={track.image}
          alt={track.name}
          width={80}
          height={80}
        />
        <div className="flex flex-1 flex-col gap-px">
          <TrackName name={track.name} uri={track.uri} />
          <TrackArtist
            artist={getArtistName(track)}
            artistId={getArtistId(track)}
            uri={getArtistUri(track)}
          />
          {extraInfo && (
            <div className="mt-auto text-muted-foreground text-xs">
              {extraInfo}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function TrackName(
  props: { name: string; uri: string } & React.ComponentProps<"a">,
) {
  const { name, className, uri, ...rest } = props;
  return (
    <a
      className={cn(
        "line-clamp-2 w-fit cursor-pointer text-ellipsis font-medium hover:underline",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={uri}
      onClick={(event) => {
        event.stopPropagation();
      }}
      {...rest}
    >
      {name}
    </a>
  );
}

export function TrackArtist(
  props: {
    artist: string;
    artistId?: string;
    uri: string;
  } & React.ComponentProps<"a">,
) {
  const { artist, artistId, className, uri, ...rest } = props;

  if (artistId) {
    return (
      <Link
        className={cn(
          "text-muted-foreground text-sm hover:underline",
          className,
        )}
        to={`/artist/${artistId}`}
        viewTransition
        {...rest}
      >
        <span className="cursor-pointer hover:underline">{artist}</span>
      </Link>
    );
  }

  return (
    <a
      className={cn(
        "cursor-pointer text-muted-foreground text-sm hover:underline",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={uri}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {artist}
    </a>
  );
}

export function TrackAlbum(
  props: {
    album: string;
    albumId?: string;
    uri: string;
  } & React.ComponentProps<"a">,
) {
  const { album, albumId, className, uri, ...rest } = props;

  if (albumId) {
    return (
      <Link
        className={cn(
          "text-muted-foreground text-s hover:underline",
          className,
        )}
        to={`/album/${albumId}`}
        viewTransition
        {...rest}
      >
        <span className="cursor-pointer hover:underline">{album}</span>
      </Link>
    );
  }

  return (
    <a
      className={cn(
        "cursor-pointer text-muted-foreground text-sm hover:underline",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={uri}
      onClick={(event) => {
        event.stopPropagation();
      }}
      {...rest}
    >
      {album}
    </a>
  );
}

export function TrackImage(
  props: React.ComponentProps<"img"> & { id: string },
) {
  const { className, id, ...rest } = props;
  return (
    <Image
      className={cn("rounded-md", className)}
      style={{
        viewTransitionName: `track-image-${id}`,
      }}
      {...rest}
    />
  );
}
