import { Link } from "react-router";
import { cn } from "~/components/utils";
import type { Artist as ArtistType } from "~/lib.server/services/db";
import { Image } from "../ui/image";

export function Artist(
  props: {
    artist: ArtistType;
  } & React.ComponentProps<"a">,
) {
  const { artist, ...rest } = props;
  return (
    <Link to={`/artist/${artist.id}`} viewTransition {...rest}>
      <div className="flex flex-1 gap-x-2 rounded-md bg-card px-3.5 py-3 transition-colors duration-150 hover:bg-accent">
        <ArtistImage
          id={artist.id}
          src={artist.image}
          alt={artist.name}
          width={80}
          height={80}
        />

        <ArtistName name={artist.name} uri={artist.uri} />
      </div>
    </Link>
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
      className={cn("rounded", className)}
      style={{
        viewTransitionName: `artist-image-${id}`,
      }}
      name={alt}
      alt={alt}
      {...rest}
    />
  );
}
