import type { MetaFunction } from '@remix-run/node';
import { Form, useSearchParams, useSubmit, useNavigation, Link, Outlet } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/server-runtime';
import type { ChangeEvent } from 'react';
import { useRef, useEffect, useState } from 'react';
import { X } from 'react-feather';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import explicitImage from '~/lib/assets/explicit-solid.svg';
import { getSpotifyClient } from '~/services/spotify.server';

const Analysis = () => {
  const results = useTypedLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchDefault = searchParams.get('spotify');
  const [search, setSearch] = useState(searchDefault ?? '');
  const ref = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const transition = useNavigation();
  const busy = transition.formData?.has('spotify') ?? false;

  useEffect(() => {
    const delaySubmit = setTimeout(() => {
      if (search.trim().length > 0) {
        console.log('ref.current', ref.current);
        submit(ref.current);
      }
    }, 1000);

    return () => clearTimeout(delaySubmit);
  }, [search, submit]);

  const clearSearch = () => {
    setSearch('');
    searchParams.delete('spotify');
    setSearchParams(searchParams, {
      replace: true,
      state: { scroll: false },
    });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim()) {
      setSearch(e.currentTarget.value);
    } else {
      clearSearch();
    }
  };

  return (
    <div className='stack-3 h-full'>
      <Form ref={ref} method='get'>
        <div className='stack-h-2 mb-0 flex-1 items-center'>
          <div className='relative isolate z-10 flex w-full overflow-y-hidden'>
            <input
              className='w-full border-b border-b-musy-200 bg-transparent py-2 pl-2 pr-9 text-[14px] text-musy-200 transition-all duration-300 ease-in-out placeholder:text-musy-200 placeholder:opacity-70 focus:outline-musy-200'
              name='spotify'
              value={search}
              placeholder='Search for a song'
              autoComplete='off'
              onChange={onChange}
            />
            {search && (
              <div
                className='absolute right-1 flex h-9 w-16 justify-end pr-1'
                children={
                  <>
                    {/* {busy && <Spinner size="xs" mr={2} />} */}
                    <button
                      aria-label='close'
                      className='rounded'
                      onClick={() => {
                        setSearch('');
                        searchParams.delete('spotify');
                        setSearchParams(searchParams, {
                          replace: true,
                          state: { scroll: false },
                        });
                      }}
                    >
                      <X />
                    </button>
                  </>
                }
              />
            )}
          </div>
        </div>
      </Form>
      {results &&
        results.map((track) => (
          <Link
            className='stack-h-3 shrink-0 grow-0 rounded-sm bg-transparent hover:bg-musy-800'
            key={track.id}
            to={`/analysis/${track.id}`}
            onClick={clearSearch}
          >
            <div className='stack'>
              <img
                className='w-32 shrink-0'
                alt='album-cover'
                src={track.album.images[0].url}
                draggable={false}
              />
            </div>
            <div className='stack justify-between'>
              <div className='stack'>
                <p className='line-clamp-3 break-all text-[13px] font-bold'>{track.name}</p>
                <div className='flex items-center'>
                  {track.explicit && (
                    <img src={explicitImage} alt='explicit' className='mr-1 w-[19px]' />
                  )}
                  <p className='text-[11px] opacity-80'>{track.artists[0].name}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}

      <Outlet />
    </div>
  );
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchURL = url.searchParams.get('spotify');
  if (!searchURL) return typedjson(null);

  const { spotify } = await getSpotifyClient('1295028670');
  invariant(spotify, 'No access to spotify API');

  const {
    body: { tracks },
  } = await spotify.searchTracks(searchURL).catch((err) => {
    throw typedjson([], { status: err.statusCode });
  });

  const results = tracks?.items;
  return typedjson(results);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || data.length === 0) {
    return [
      {
        title: 'musy Analysis',
      },
      {
        description: `musy is a powerful song analysis tool that helps you unlock the secrets of your favorite tracks.`,
      },
    ];
  }

  const track = data[0];

  return [
    {
      title: `${track?.name} | musy Analysis`,
    },
    {
      description: `musy is a powerful song analysis tool that helps you unlock the secrets of your favorite tracks.`,
    },
  ];
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Analysis;
