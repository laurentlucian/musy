import type { ComponentPropsWithRef } from "react";
import { cn } from "~/components/utils";

function Input({
  className,
  type,
  ref,
  ...props
}: ComponentPropsWithRef<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-input-background px-3 py-2 text-base leading-[1.4] tracking-[-0.2px] transition-colors duration-100 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground hover:border-button-outline-border focus-visible:border-input-focus focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}

export { Input };
