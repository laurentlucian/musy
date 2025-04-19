import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import type { loader } from "~/routes/resources/onboarding";

export function OnboardingSonner() {
  const fetcher = useFetcher<typeof loader>();
  const toastId = useRef<number | string>(null);

  const fetch = () => {
    fetcher.submit(null, {
      action: "/api/onboarding",
      method: "GET",
    });
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      const progress = fetcher.data;

      if (toastId.current) {
        toast.loading("onboarding your spotify...", {
          description: `${progress}%`,
          id: toastId.current,
        });
      } else {
        toastId.current = toast.loading("onboarding your spotify...");
      }

      setTimeout(() => {
        fetch();
      }, 1000);
    } else if (toastId.current) {
      toast.success("onboarding complete!", {
        id: toastId.current,
      });
      toastId.current = null;
    }
  }, [fetcher.data]);

  return null;
}
