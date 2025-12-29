import type { Artist as ArtistType } from "~/lib/services/db.server";
import { cn } from "~/lib/utils";
import { Image } from "../ui/image";

export function Artist(
  props: {
    artist: ArtistType;
  } & React.ComponentProps<"a">,
) {
  const { artist, className, ...rest } = props;
  return (
    <a
      className={cn(
        "flex flex-1 gap-x-2 rounded-md bg-card px-3.5 py-3 transition-colors duration-150 hover:bg-accent",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={props.artist.uri}
      {...rest}
    >
      <ArtistImage
        id={artist.id}
        src={artist.image}
        alt={artist.name}
        width={80}
        height={80}
      />

      <ArtistName name={artist.name} uri={artist.uri} />
    </a>
  );
}

export function ArtistName(
  props: { name: string; uri: string } & React.ComponentProps<"a">,
) {
  const { name, className, uri, ...rest } = props;
  return (
    <a
      className={cn(
        "line-clamp-2 cursor-pointer text-ellipsis font-medium hover:underline",
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

export function ArtistImage(
  props: React.ComponentProps<"img"> & { id: string },
) {
  const { className, id, alt, ...rest } = props;
  return (
    <Image
      className={cn("rounded-full", className)}
      style={{
        viewTransitionName: `track-image-${id}`,
      }}
      name={alt}
      alt={alt}
      {...rest}
    />
  );
}
