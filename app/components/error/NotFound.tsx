import { Link } from "@remix-run/react";

const NotFound = () => {
  return (
    <>
      <div className="flex">
        <h1 className="md:text-md text-sm">404 - </h1>
        <p className="text-md">Page not found</p>
      </div>
      <Link to="/" className="btn">
        Take me home
      </Link>
    </>
  );
};

export default NotFound;
