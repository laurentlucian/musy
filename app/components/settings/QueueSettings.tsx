import { type SubmitFunction } from '@remix-run/react';


import { Layer } from 'iconsax-react';

const QueueSettings = ({ allowQueue, submit }: { allowQueue: string; submit: SubmitFunction }) => {
  // const onChange = (value: string) => {
  //   submit({ 'allow-queue': value }, { method: 'POST', replace: true });
  // };

  return (
      <div className='flex flex-col sm:gap-3 md:gap-0 lg:gap-5 content-center'>
        <div className='flex gap-5'>
          <Layer color={allowQueue === 'off' ? '#555555' : '#1DB954'} variant='Bold' />
          <label className='sm:text-sm lg:text-md mb-0' htmlFor='allow-queue'>
            queue
          </label>
        </div>
      </div>
  );
};

export default QueueSettings;
