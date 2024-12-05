import "react";

declare module "react" {
  function use<T>(promise: Promise<T>): T;
}
