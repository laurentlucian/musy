import { data } from "react-router";

export function loader() {
  return data(null, { status: 404 });
}

export default function WellKnown() {
  return null;
}
