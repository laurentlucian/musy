import { type SubmitFunction } from '@remix-run/react';

import { Layer } from 'iconsax-react';

const QueueSettings = ({ allowQueue, submit }: { allowQueue: string; submit: SubmitFunction }) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    submit({ 'allow-queue': e.target.checked ? 'on' : 'off' }, { method: 'POST', replace: true });
  };

  return (
    <div className='flex flex-col sm:gap-3 md:gap-0 lg:gap-5 content-center'>
      <label className='flex gap-5 sm:text-sm lg:text-md mb-0 cursor-pointer' htmlFor='allow-queue'>
        <Layer color={allowQueue === 'off' ? '#555555' : '#1DB954'} variant='Bold' />
        queue
      </label>
      <input
        className='hidden'
        checked={allowQueue !== 'off'}
        id='allow-queue'
        type='checkbox'
        onChange={onChange}
      />
    </div>
  );
};

export default QueueSettings;
