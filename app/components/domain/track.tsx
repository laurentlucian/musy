import { Link, useNavigate } from "react-router";
import type { Track as TrackType } from "~/lib/services/db.server";
import { cn } from "~/lib/utils";
import { Image } from "../ui/image";

export function Track(
  props: {
    track: TrackType;
  } & React.ComponentProps<"a">,
) {
  const { track, ...rest } = props;
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
        <div>
          <TrackName name={track.name} uri={track.uri} />
          <TrackArtist artist={track.artist} uri={track.artistUri} />
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
  props: { artist: string; uri: string } & React.ComponentProps<"a">,
) {
  const { artist, className, uri, ...rest } = props;
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
