import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";

export function Image({
  src,
  alt,
  className,
  ...props
}: ComponentProps<"img">) {
  return (
    <img
      {...props}
      src={src}
      alt={alt || "image"}
      draggable={false}
      className={cn("rounded", className)}
    />
  );
}
