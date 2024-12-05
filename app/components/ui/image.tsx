import { cn } from "@lib/utils";
import type { ComponentProps } from "react";

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
