import { Link } from "react-router";
import "./logo.css";

export function Logo() {
  return (
    <Link to="/" className="brand flex items-center" aria-label="Musy home">
      <svg viewBox="0 0 100 100" className="size-8" aria-hidden="true">
        <path
          d="M16 38 17 32 24 20 34 12 50 8 67 12 77 20 84 32 85 38 80 37 77 26 64 19 50 17 37 19 27 26 23 36 20 39Z"
          fill="#555756"
          stroke="#aaa"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <path
          d="m17 32 7-12 26-7-13 6-10 7-4 10Zm33-24 17 4 10 8-27-7Z"
          fill="#707271"
        />
        <path
          d="m11 39 8-3 3 5-7 23-3 1-5-4-1-7Z"
          fill="#484a49"
          stroke="#aaa"
          strokeWidth="0.6"
        />
        <path
          d="m11 39 7 1-6 19-5 2-1-7Zm71-2 8 2 5 15-3 7-7-21Z"
          fill="#656766"
        />
        <path
          d="m82 37 8 2 5 15-2 7-5 4-3-1-7-23Z"
          fill="#484a49"
          stroke="#aaa"
          strokeWidth="0.6"
        />
        <path d="m82 37 8 2-7 2-5 0Zm1 4 7-2 5 15-3 2Z" fill="#626463" />
        <path
          d="m18 68 9-32 12 12 11-2 11 2 12-12 9 32 1 11-10 10-12 3-11 2-14-2-10-3-10-10Z"
          fill="#252726"
          stroke="#aaa"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <path
          d="m18 68 9-32 6 18Zm9-32 12 12-6 6Zm12 12 11-2-17 8Z"
          fill="#505251"
        />
        <path d="m27 36 12 12-6 6Z" fill="#343635" />
        <path d="m50 46 11 2 6 6H33Z" fill="#353736" />
        <path d="m61 48 12-12-6 18Z" fill="#606261" />
        <path d="m73 36 9 32-15-14Z" fill="#363837" />
        <path d="m33 54 15 25H34L18 68Zm34 0 15 14-17 11H52Z" fill="#202221" />
        <path d="m18 68 16 11-17-1Zm64 0 1 11H65Z" fill="#181a19" />
        <path
          d="m17 79 17 0 16 3-14 10-10-3Zm33 3 15-3 8 10-12 3-11 2Z"
          fill="#141615"
        />
        <path d="m48 79 4 0-2 3Z" fill="#0c0e0d" />
        <g fill="#f5f5f5">
          <circle className="cat-eye" cx="34.5" cy="70.5" r="4.2" />
          <circle className="cat-eye" cx="65.5" cy="70.5" r="4.2" />
        </g>
      </svg>
    </Link>
  );
}
