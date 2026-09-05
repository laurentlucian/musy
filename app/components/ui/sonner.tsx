import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "w-fit! rounded-2xl! border-border! bg-popover! text-foreground! shadow-popover! text-sm! tracking-[-0.2px]",
          description: "text-muted-foreground!",
          actionButton:
            "rounded-full! bg-button-filled! text-primary-foreground!",
          cancelButton: "rounded-full! bg-secondary! text-foreground!",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
