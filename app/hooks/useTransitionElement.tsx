import { useTransition } from '@remix-run/react';

const useTransitionElement = (matcher = true) => {
  const transition = useTransition();

  const isLoading = transition.state === 'loading' && matcher;

  if (!isLoading) return null;

  return (
    <>
      <div className="la-line-scale-pulse-out la-dark">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </>
  );
};

export default useTransitionElement;
