import type { ComponentProps } from "react";
import { useState } from "react";
import { cn } from "~/lib/utils";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase();
  }
  return (
    parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
  ).toUpperCase();
}

export function Image({
  src,
  alt,
  className,
  name,
  width,
  height,
  style,
  ...props
}: ComponentProps<"img"> & { name?: string | null }) {
  const [showInitials, setShowInitials] = useState(false);

  if (showInitials && name) {
    const size = width || height;
    return (
      <div
        className={cn(
          "flex aspect-square flex-1 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
          className,
        )}
        style={{
          width: size,
          height: size,
          ...style,
        }}
      >
        <span className="font-medium">{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt || "image"}
      draggable={false}
      className={cn("rounded", className)}
      width={width}
      height={height}
      style={style}
      onError={() => {
        if (name) {
          setShowInitials(true);
        }
      }}
    />
  );
}
