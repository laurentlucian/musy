import { Button } from '@chakra-ui/react';
import { useNavigate, useTransition } from '@remix-run/react';
import { DocumentText } from 'iconsax-react';
import Waver from '../Waver';

const AnalyzeTrack = ({ trackId }: { trackId: string }) => {
  const navigate = useNavigate();
  const transition = useTransition();
  const isLoading = transition.location?.pathname.includes('analysis');

  return (
    <Button
      leftIcon={<DocumentText />}
      onClick={() => navigate(`/analysis/${trackId}`)}
      variant="ghost"
      justifyContent="left"
      w={['100vw', '550px']}
    >
      {isLoading ? <Waver /> : 'Analyze'}
    </Button>
  );
};

export default AnalyzeTrack;