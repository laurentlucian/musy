import { cn } from "../utils";

interface PopularityIndicatorProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function PopularityIndicator({
  value,
  max = 100,
  className,
  showLabel = true,
}: PopularityIndicatorProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        {showLabel && (
          <span className="text-muted-foreground text-xs uppercase tracking-wider">
            Popularity
          </span>
        )}
        <span className="font-medium text-foreground text-sm">{value}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
