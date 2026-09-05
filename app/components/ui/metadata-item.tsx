import { cn } from "../utils";

interface MetadataItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  variant?: "default" | "data";
}

export function MetadataItem({
  label,
  value,
  className,
  variant = "default",
}: MetadataItemProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </span>
      <span
        className={cn(
          "text-sm",
          variant === "data" ? "font-mono text-foreground" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
