import { Link } from '@remix-run/react';

const NotFound = () => {
  return (
    <>
      <div className="flex">
        <h1 className="text-sm md:text-md">404 - </h1>
        <p className="text-md">Page not found</p>
      </div>
      <Link to="/" className="btn">
        Take me home
      </Link>
    </>
  );
};

export default NotFound;
