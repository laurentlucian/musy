import { useNavigate, useNavigation } from '@remix-run/react';

import { Button } from '@chakra-ui/react';

import { DocumentText } from 'iconsax-react';

import Waver from '~/lib/icons/Waver';

const AnalyzeTrack = ({ trackId }: { trackId: string }) => {
  const navigate = useNavigate();
  const transition = useNavigation();
  const isLoading = transition.location?.pathname.includes('analysis');

  return (
    <Button
      leftIcon={<DocumentText />}
      onClick={() => navigate(`/analysis/${trackId}`)}
      variant="ghost"
      justifyContent="left"
      w={['100vw', '100%']}
      color="musy.200"
      _hover={{ color: 'white' }}
    >
      {isLoading ? <Waver /> : 'Analyze'}
    </Button>
  );
};

export default AnalyzeTrack;
