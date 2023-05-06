import { redirect } from 'remix-typedjson';

const Index = () => null; // @todo landing page

export const loader = () => redirect('/home');

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
