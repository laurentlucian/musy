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
  const getColorClass = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

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
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getColorClass(),
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
