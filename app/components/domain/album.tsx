import { Link } from "react-router";
import { cn } from "~/components/utils";
import type { Album as AlbumType } from "~/lib.server/services/db";
import { Image } from "../ui/image";

export function Album(
  props: {
    album: AlbumType & { artist?: { name?: string; uri?: string } };
  } & React.ComponentProps<"a">,
) {
  const { album, ...rest } = props;
  return (
    <Link to={`/album/${album.id}`} viewTransition {...rest}>
      <div className="flex flex-1 gap-x-2 rounded-md bg-card px-3.5 py-3 transition-colors duration-150 hover:bg-accent">
        <AlbumImage
          id={album.id}
          src={album.image}
          alt={album.name}
          width={80}
          height={80}
        />

        <div>
          <AlbumName name={album.name} uri={album.uri} />
          {album.artist && (
            <AlbumArtist
              artist={album.artist.name || "Unknown"}
              uri={album.artist.uri || album.uri}
            />
          )}
        </div>
      </div>
    </Link>
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
