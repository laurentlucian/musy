import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/components/utils";
import type { Artist as ArtistType } from "~/lib.server/services/db";
import { Image } from "../ui/image";

export function Artist(
  props: {
    artist: ArtistType;
  } & React.ComponentProps<"a">,
) {
  const { artist, className, ...rest } = props;
  return (
    <div
      className={cn(
        "group flex min-w-0 items-center gap-3 border-border border-b py-3",
        className,
      )}
    >
      <Link
        to={`/artist/${artist.id}`}
        viewTransition
        aria-label={`View ${artist.name}`}
        {...rest}
        className="shrink-0"
      >
        <ArtistImage
          id={artist.id}
          src={artist.image}
          alt={artist.name}
          width={56}
          height={56}
          className="size-14 object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/artist/${artist.id}`}
          viewTransition
          className="block truncate font-medium leading-snug hover:text-primary"
        >
          {artist.name}
        </Link>
        <span className="text-muted-foreground text-sm">Artist</span>
      </div>
      <a
        href={artist.uri}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${artist.name} in Spotify`}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "shrink-0",
        )}
      >
        <ArrowUpRight />
      </a>
    </div>
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
