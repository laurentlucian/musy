import { cn } from "~/lib/utils";

export function Waver({
  className,
  dark,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "la-line-scale-pulse-out mx-auto",
        { "la-dark": dark },
        className,
      )}
    >
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}
