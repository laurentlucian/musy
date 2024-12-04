import { useLayoutEffect } from "react";
import { toast } from "sonner";

export function useFetcherToast(error?: string | null, success?: string) {
  useLayoutEffect(() => {
    if (error) {
      toast.error(error);
    } else if (error === null) {
      toast.success(success);
    }
  }, [error]);
  return null;
}
