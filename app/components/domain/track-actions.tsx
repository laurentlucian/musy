import { useFetcher } from "react-router";
import { Waver } from "~/components/icons/waver";
import { Button } from "~/components/ui/button";

export function TrackLikeButton({
  uri,
  provider,
}: {
  uri: string;
  provider: string;
}) {
  const fetcher = useFetcher();
  const isLoading =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <Button
      type="button"
      disabled={isLoading}
      onClick={() => {
        const formData = new FormData();
        formData.set("uri", uri);
        formData.set("provider", provider);
        fetcher.submit(formData, {
          method: "post",
          action: "/actions/like",
        });
      }}
    >
      {isLoading ? <Waver /> : "Like"}
    </Button>
  );
}

export function TrackQueueButton({
  uri,
  provider,
}: {
  uri: string;
  provider: string;
}) {
  const fetcher = useFetcher();
  const isLoading =
    fetcher.state === "submitting" || fetcher.state === "loading";

  return (
    <Button
      type="button"
      disabled={isLoading}
      onClick={() => {
        const formData = new FormData();
        formData.set("uri", uri);
        formData.set("provider", provider);
        fetcher.submit(formData, {
          method: "post",
          action: "/actions/queue",
        });
      }}
    >
      {isLoading ? <Waver /> : "Queue"}
    </Button>
  );
}
