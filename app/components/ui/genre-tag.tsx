import { cn } from "../utils";

interface GenreTagProps {
  genre: string;
  className?: string;
}

export function GenreTag({ genre, className }: GenreTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground text-xs transition-colors hover:bg-accent/80",
        className,
      )}
    >
      {genre}
    </span>
  );
}
