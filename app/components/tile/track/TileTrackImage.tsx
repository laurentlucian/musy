import type { BoxProps, ImageProps } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';

type TileTrackImageProps = {
  box?: BoxProps;
  image?: ImageProps;
};

const TileTrackImage = ({ box, image }: TileTrackImageProps) => {
  return (
    <Flex {...box}>
      <Image borderRadius="1px" w="100%" draggable={false} objectFit="cover" {...image} />
    </Flex>
  );
};

export default TileTrackImage;
