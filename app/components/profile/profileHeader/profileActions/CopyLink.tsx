import { LinkIcon } from '@chakra-ui/icons';
import { MenuItem } from '@chakra-ui/react';

type LinkTypes = {
  bg: string;
  color: string;
};

const CopyLink = ({ bg, color }: LinkTypes) => {
  const handleCopyLinkClick = () => {
    // Get the current page's URL
    const currentUrl = window.location.href;
    // Copy the URL to the clipboard
    navigator.clipboard.writeText(currentUrl).then(
      () => {
        // console.log('URL copied to clipboard!');
      },
      (err) => {
        console.error('Failed to copy URL: ', err);
      },
    );
  };
  return (
    <>
      <MenuItem
        icon={<LinkIcon boxSize="18px" />}
        bg={bg}
        color={color}
        _hover={{ color: 'grey' }}
        onClick={handleCopyLinkClick}
      >
        copy link
      </MenuItem>
    </>
  );
};

export default CopyLink;
