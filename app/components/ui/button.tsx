import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/components/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium text-sm ring-offset-background transition-colors duration-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border border-button-filled-border bg-button-filled text-primary-foreground hover:bg-button-filled-hover active:bg-button-filled-active",
        destructive:
          "bg-destructive/6 text-destructive hover:bg-destructive/8 active:bg-destructive/10",
        outline:
          "border border-button-outline-border bg-transparent text-foreground hover:bg-accent active:bg-button-secondary-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-button-secondary-hover active:bg-button-secondary-active",
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-button-secondary-hover",
        link: "text-primary underline-offset-4 hover:underline",
        nav: "rounded-xl text-muted-foreground text-xs hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:bg-button-secondary-hover disabled:text-foreground disabled:opacity-100 sm:w-full",
        "nav-sub": "flex-1 justify-center bg-card hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-4",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentPropsWithRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  ref,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
}

export { Button, buttonVariants };
