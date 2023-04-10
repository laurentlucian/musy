import { redirect } from 'remix-typedjson';

const Index = () => {
  // @todo landing page
  return null;
};

export const loader = async () => {
  return redirect('/home/friends');
};

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
