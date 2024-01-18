import { Link, useParams } from '@remix-run/react';

import type { Playlist } from '@prisma/client';

import Tooltip from '~/components/Tooltip';
import { decodeHtmlEntity } from '~/lib/utils';

const PlaylistTile = ({ playlist }: { playlist: Playlist }) => {
  const { id } = useParams();

  return (
    <div className='w-48 shrink-0 cursor-pointer'>
      <Link to={`/${id}/${playlist.id}`} className='stack-2'>
        <div className='flex flex-col'>
          <Tooltip label={playlist.name} placement='top-start'>
            <img
              className='h-[200px] w-[200px] object-cover'
              src={playlist.image}
              draggable={false}
              alt='playlist'
            />
          </Tooltip>
        </div>
        <div className='stack justify-between'>
          <p className='overflow-hidden overflow-ellipsis whitespace-normal break-all text-xs leading-5'>
            {playlist.name}
          </p>
          {playlist.description && (
            <div className='flex items-center'>
              <p className='overflow-hidden overflow-ellipsis text-xs opacity-80'>
                {decodeHtmlEntity(playlist.description)}
              </p>
            </div>
          )}
          <p className='text-[11px] opacity-70'>{playlist.total} songs</p>
        </div>
      </Link>
    </div>
  );
};

export default PlaylistTile;
