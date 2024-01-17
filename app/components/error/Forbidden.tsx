import { Link } from "@remix-run/react";

const Forbidden = () => {
  return (
    <>
      <div className="stack-h-1">
        <h1 className="text-base md:text-base">401 - </h1>
        <p>Not authorized</p>
      </div>
      <Link to="/">Take me home</Link>
    </>
  );
};

export default Forbidden;
