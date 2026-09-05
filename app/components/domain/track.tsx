import { Link } from "react-router";
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
  const { track, extraInfo, className, ...rest } = props;
  return (
    <div
      className={cn(
        "group flex min-w-0 items-center gap-3 border-b border-border py-3",
        className,
      )}
    >
      <Link
        to={`/track/${track.id}`}
        viewTransition
        aria-label={`View ${track.name}`}
        {...rest}
        className="shrink-0"
      >
        <TrackImage
          id={track.id}
          src={track.image}
          alt={track.name}
          width={56}
          height={56}
          className="size-14 object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/track/${track.id}`}
          viewTransition
          className="block truncate font-medium leading-snug hover:text-primary"
        >
          {track.name}
        </Link>
        <TrackArtist
          artist={getArtistName(track)}
          artistId={getArtistId(track)}
          uri={getArtistUri(track)}
          className="block truncate"
        />
        {extraInfo && (
          <div className="mt-1 text-xs text-muted-foreground">{extraInfo}</div>
        )}
      </div>
      <a
        href={track.uri}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${track.name} in Spotify`}
        className="flex size-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
      >
        ↗
      </a>
    </div>
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
      {...rest}
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
          "text-muted-foreground text-sm hover:underline",
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
  return <Image className={cn("rounded-md", className)} {...rest} />;
}
