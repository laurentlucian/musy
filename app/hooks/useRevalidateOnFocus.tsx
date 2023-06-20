import { useRevalidator } from '@remix-run/react';

import useVisibilityChange from './useVisibilityChange';

const useRevalidateOnFocus = () => {
  const { revalidate } = useRevalidator();
  useVisibilityChange((isVisible) => isVisible && revalidate());

  return null;
};

export default useRevalidateOnFocus;
