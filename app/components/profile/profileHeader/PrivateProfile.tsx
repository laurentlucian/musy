import { motion } from 'framer-motion';
import { Ghost } from 'iconsax-react';

const PrivateProfile = ({ name }: { name: string }) => {
  const ghost = (
    <motion.div animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 5, loop: Infinity }}>
      <Ghost size='210' />
    </motion.div>
  );
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }}>
      <div className='stack-2 items-center'>
        {ghost}
        <p className='text-center opacity-50'>{name}&apos;s profile is private</p>
        <button className='md:w-300px w-72' onClick={() => window.history.back()}>
          go back
        </button>
      </div>
    </motion.div>
  );
};

export default PrivateProfile;
