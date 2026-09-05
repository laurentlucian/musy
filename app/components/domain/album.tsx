import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/components/utils";
import type { Album as AlbumType } from "~/lib.server/services/db";
import { Image } from "../ui/image";

export function Album(
  props: {
    album: AlbumType & { artist?: { name?: string; uri?: string } };
  } & React.ComponentProps<"a">,
) {
  const { album, className, ...rest } = props;
  return (
    <div
      className={cn(
        "group flex min-w-0 items-center gap-3 border-border border-b py-3",
        className,
      )}
    >
      <Link
        to={`/album/${album.id}`}
        viewTransition
        aria-label={`View ${album.name}`}
        {...rest}
        className="shrink-0"
      >
        <AlbumImage
          id={album.id}
          src={album.image}
          alt={album.name}
          width={56}
          height={56}
          className="size-14 object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/album/${album.id}`}
          viewTransition
          className="block truncate font-medium leading-snug hover:text-primary"
        >
          {album.name}
        </Link>
        {album.artist && (
          <AlbumArtist
            artist={album.artist.name || "Unknown"}
            uri={album.artist.uri || album.uri}
          />
        )}
      </div>
      <a
        href={album.uri}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${album.name} in Spotify`}
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

export function AlbumName(
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

export function AlbumArtist(
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

export function AlbumImage(
  props: React.ComponentProps<"img"> & { id: string },
) {
  const { className, id, alt, ...rest } = props;
  return (
    <Image
      className={cn("rounded-md", className)}
      style={{
        viewTransitionName: `album-image-${id}`,
      }}
      name={alt}
      alt={alt}
      {...rest}
    />
  );
}
