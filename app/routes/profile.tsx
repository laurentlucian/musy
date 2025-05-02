import { prisma } from "@lib/services/db.server";
import { endOfYear, setYear, startOfYear } from "date-fns";
import {
  data,
  href,
  Outlet,
  redirect,
  useMatches,
  useNavigate,
  useNavigation,
  useParams,
} from "react-router";
import { Artist } from "~/components/domain/artist";
import { NavLinkSub } from "~/components/domain/nav";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { NumberAnimated } from "~/components/ui/number-animated";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Route } from "./+types/profile";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const userId = params.userId ?? context.userId;

  if (!userId) throw redirect("/settings");

  const profile = await prisma.profile.findFirst({
    where: {
      id: userId,
    },
  });

  if (!profile) throw data("not found", { status: 404 });

  const url = new URL(request.url);
  const year = +(url.searchParams.get("year") ?? "2025");
  const date = setYear(new Date(), year);

  const liked = await prisma.likedSongs.count({
    where: {
      userId,
      createdAt: {
        gte: startOfYear(date),
        lte: endOfYear(date),
      },
    },
  });

  let length = 0;
  let minutes = 0;
  const artists: Record<string, number> = {};
  const albums: Record<string, number> = {};
  const songs: Record<string, number> = {};

  const take = 2500;
  let skip = 0;
  let all = false;

  while (!all) {
    const played = await prisma.recentSongs.findMany({
      where: {
        userId,
        playedAt: {
          gte: startOfYear(date),
          lte: endOfYear(date),
        },
      },
      take,
      skip,
      orderBy: {
        playedAt: "desc",
      },
      select: {
        track: {
          select: {
            uri: true,
            name: true,
            artist: true,
            albumName: true,
            duration: true,
          },
        },
      },
    });

    if (played.length < take) {
      all = true;
    }

    skip += played.length;
    const batch = calculateStats(played);
    length += batch.played;
    minutes += batch.minutes;

    for (const [artist, count] of Object.entries(batch.artists)) {
      artists[artist] = (artists[artist] ?? 0) + count;
    }
    for (const [album, count] of Object.entries(batch.albums)) {
      albums[album] = (albums[album] ?? 0) + count;
    }
    for (const [song, count] of Object.entries(batch.songs)) {
      songs[song] = (songs[song] ?? 0) + count;
    }
  }

  const { artist, album, song } = getTopItems({
    songs: songs,
    albums: albums,
    artists: artists,
  });

  const range = url.searchParams.get("range") ?? "long_term";
  const type = url.searchParams.get("type") ?? "songs";

  const top = await prisma.top.findUnique({
    include: {
      songs: {
        include: {
          tracks: true,
        },
        take: 1,
        where: {
          type: range,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      artists: {
        include: {
          artists: true,
        },
        take: 1,
        where: {
          type: range,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    where: {
      userId,
    },
  });

  return {
    userId,
    profile,
    liked,
    year,
    played: length,
    minutes,
    artist,
    album,
    song,
    top,
    type,
    range,
  };
}

export default function Profile({
  loaderData: {
    profile,
    liked,
    year,
    played,
    minutes,
    artist,
    album,
    song,
    top,
    type,
    range,
  },
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { userId } = useParams();
  const matches = useMatches();
  const root = matches.length === 3;

  return (
    <article className="flex flex-1 flex-col gap-6 self-stretch px-6 sm:flex-row sm:items-start">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-lg bg-card p-4">
          <div className="flex items-center gap-2">
            {profile.image && (
              <img
                className="size-10 rounded-full"
                src={profile.image}
                alt={profile.name ?? "pp"}
              />
            )}
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-2xl">{profile.name}</h1>
              <div>{navigation.state === "loading" && <Waver />}</div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">{profile.bio}</p>
          <NavLinkSub
            to={href("/profile/:userId?", {
              userId,
            })}
          >
            Top
          </NavLinkSub>
          <NavLinkSub to="liked">Liked</NavLinkSub>
          <NavLinkSub to="recent">Listened</NavLinkSub>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Select
              value={year.toString()}
              onValueChange={(data) => {
                navigate({
                  search: `?year=${data}`,
                });
              }}
            >
              <SelectTrigger className="min-w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-4 whitespace-nowrap">
            <div className="rounded-lg bg-card p-4">
              <p className="font-bold text-3xl">
                <NumberAnimated value={played} key={year} />
              </p>
              <p className="text-muted-foreground text-sm">songs played</p>
            </div>
            <div className="flex gap-4">
              <div className="rounded-lg bg-card p-4">
                <p className="font-bold text-3xl">
                  <NumberAnimated value={liked} key={year} />
                </p>
                <p className="text-muted-foreground text-sm">songs liked</p>
              </div>
            </div>
            <div className="rounded-lg bg-card p-4">
              <p className="font-bold text-3xl">
                <NumberAnimated value={minutes} key={year} />
              </p>
              <p className="text-muted-foreground text-sm">minutes listened</p>
            </div>
          </div>

          {song && (
            <div className="rounded-lg bg-card p-4">
              <p className="font-bold text-2xl">{song}</p>
              <p className="text-muted-foreground text-sm">
                most listened song
              </p>
            </div>
          )}

          {artist && (
            <div className="rounded-lg bg-card p-4">
              <p className="font-bold text-2xl">{artist}</p>
              <p className="text-muted-foreground text-sm">
                most listened artist
              </p>
            </div>
          )}

          {album && (
            <div className="rounded-lg bg-card p-4">
              <p className="font-bold text-2xl">{album}</p>
              <p className="text-muted-foreground text-sm">
                most listened album
              </p>
            </div>
          )}
        </div>
      </div>
      {top && root && (
        <div className="flex flex-col gap-2">
          <div className="flex h-12 items-center gap-2">
            <p className="text-muted-foreground text-sm">Top</p>
            <Select
              defaultValue={type}
              onValueChange={(data) => {
                navigate({
                  search: `?type=${data}`,
                });
              }}
            >
              <SelectTrigger className="min-w-[100px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="songs">Songs</SelectItem>
                <SelectItem value="artists">Artists</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={range}
              onValueChange={(data) => {
                navigate({
                  search: `?range=${data}`,
                });
              }}
            >
              <SelectTrigger className="min-w-[100px]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long_term">Year</SelectItem>
                <SelectItem value="medium_term">Half Year</SelectItem>
                <SelectItem value="short_term">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Top top={top} type={type} />
          </div>
        </div>
      )}
      {!root && <Outlet />}
    </article>
  );
}

function Top(props: {
  top: NonNullable<Awaited<ReturnType<typeof loader>>["top"]>;
  type: string;
}) {
  const sPos = props.top?.songs[0].trackIds.split(",").reduce(
    (acc, id, i) => {
      acc[id] = i;
      return acc;
    },
    {} as Record<string, number>,
  );

  const songs = props.top?.songs[0]?.tracks.sort(
    (a, b) => (sPos?.[a.id] ?? 0) - (sPos?.[b.id] ?? 0),
  );

  const SONGS = songs.map((track) => <Track track={track} key={track.id} />);

  const aPos = props.top?.artists[0]?.artistIds.split(",").reduce(
    (acc, id, i) => {
      acc[id] = i;
      return acc;
    },
    {} as Record<string, number>,
  );

  const artists =
    props.top?.artists[0]?.artists.sort(
      (a, b) => (aPos?.[a.id] ?? 0) - (aPos?.[b.id] ?? 0),
    ) || [];

  const ARTISTS = artists.map((artist) => (
    <Artist artist={artist} key={artist.id} />
  ));

  return (
    <div className="flex flex-col gap-2">
      {props.type === "songs" ? SONGS : ARTISTS}
    </div>
  );
}

function getTopItems(arg: {
  artists: Record<string, number>;
  albums: Record<string, number>;
  songs: Record<string, number>;
}) {
  const artist = Object.entries(arg.artists).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  const album = Object.entries(arg.albums).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  const song = Object.entries(arg.songs).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  return { artist, album, song };
}

function calculateStats(
  played: {
    track: {
      name: string;
      albumName: string;
      artist: string;
      duration: number;
    };
  }[],
) {
  const minutes = played.reduce(
    (acc, curr) => acc + curr.track.duration / 60_000,
    0,
  );

  const artists = played.reduce(
    (acc, { track }) => {
      acc[track.artist] = (acc[track.artist] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const albums = played.reduce(
    (acc, { track }) => {
      acc[track.albumName] = (acc[track.albumName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const songs = played.reduce(
    (acc, { track }) => {
      acc[track.name] = (acc[track.name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return { minutes, artists, albums, songs, played: played.length };
}
