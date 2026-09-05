import {
  BarChart3,
  Check,
  ChevronDown,
  Music,
  Radio,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { Form, redirect } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { userContext } from "~/context";
import { authenticator } from "~/lib.server/services/auth";
import type { Route } from "./+types/index";

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = context.get(userContext);

  if (userId) {
    throw redirect("/profile");
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");

  return { error, code };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { error } = loaderData;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative grid min-h-dvh grid-rows-[1fr_auto] overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col justify-center p-8">
          <p className="mb-4 font-medium text-foreground text-sm uppercase tracking-[0.1em] sm:text-base md:text-lg">
            Social Music Discovery
          </p>
          <h1 className="mb-6 font-semibold tracking-tight text-[clamp(2rem,10vw,8rem)] uppercase leading-[0.9]">
            <span className="text-foreground">Queue</span>
            <br />
            Together
          </h1>
          <p className="mb-10 max-w-[600px] text-base text-muted-foreground leading-relaxed sm:text-lg md:text-xl">
            Create collaborative music queues with friends. Discover tracks,
            share vibes, and let the music play — all powered by your Spotify
            library.
          </p>
          <div>
            <Form method="post" className="w-full max-w-sm">
              <input type="hidden" name="mode" value="authorize" />
              <input type="hidden" name="provider" value="spotify" />
              <Button type="submit" size="lg" className="gap-3">
                <img
                  src="/spotify/icon-black.png"
                  alt="Spotify"
                  className="h-6 w-6"
                />
                <span>Continue with Spotify</span>
              </Button>
            </Form>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 p-8">
          <span className="text-[0.75rem] text-muted-foreground uppercase tracking-[0.2em]">
            Scroll to explore
          </span>
          <ChevronDown className="h-6 w-6 text-foreground" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-8 py-32">
        <div className="mb-24 text-center">
          <p className="mb-4 font-semibold text-[0.75rem] text-foreground uppercase tracking-[0.3em]">
            Features
          </p>
          <h2 className="mb-4 font-semibold tracking-tight text-[clamp(2.5rem,6vw,5rem)] leading-none">
            Everything you need
          </h2>
          <p className="mx-auto max-w-[600px] text-lg text-muted-foreground leading-relaxed">
            A complete social music experience built around your Spotify account
          </p>
        </div>

        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              number: "01",
              icon: Users,
              title: "Social Queue Groups",
              description:
                "Create groups, invite friends, and build collaborative playlists together. Everyone adds tracks, everyone discovers new music.",
            },
            {
              number: "02",
              icon: Music,
              title: "Track Discovery",
              description:
                "Dive deep into any track, artist, or album. View detailed analytics, popularity metrics, and explore connections between music.",
            },
            {
              number: "03",
              icon: BarChart3,
              title: "Personal Insights",
              description:
                "See your top tracks, recent plays, and liked songs all in one place. Understand your listening habits with beautiful visualizations.",
            },
            {
              number: "04",
              icon: TrendingUp,
              title: "Auto-Sync",
              description:
                "Your music data syncs automatically from Spotify. No manual updates — always fresh, always current.",
            },
            {
              number: "05",
              icon: Radio,
              title: "Queue Delivery",
              description:
                "Tracks from your group queues are delivered directly to your Spotify queue. Seamless integration, zero friction.",
            },
            {
              number: "06",
              icon: Users,
              title: "Share & Collaborate",
              description:
                "Generate shareable links for your queue groups. Bring friends in and let the music collaboration begin.",
            },
          ].map((feature) => (
            <div
              key={feature.number}
              className="relative rounded-lg border border-border bg-card p-8"
            >
              <span className="absolute top-8 right-8 text-sm text-muted-foreground">
                {feature.number}
              </span>
              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-muted text-foreground">
                  <feature.icon size={28} />
                </div>
                <h3 className="mb-3 font-semibold text-xl">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spotify Integration Showcase */}
      <section className="relative overflow-hidden px-8 py-32">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 font-semibold text-[0.75rem] text-foreground uppercase tracking-[0.3em]">
              Integration
            </p>
            <h2 className="mb-6 font-semibold tracking-tight text-[clamp(2.5rem,5vw,4rem)] leading-[1.1]">
              Powered by
              <br />
              <span className="text-foreground">Spotify</span>
            </h2>
            <p className="mb-6 text-lg text-muted-foreground leading-relaxed">
              Musy connects directly to your Spotify account, giving you full
              access to your music library while adding powerful social
              features.
            </p>
            <ul className="space-y-3">
              {[
                "Access your liked songs & playlists",
                "View top tracks & listening history",
                "Explore artists, albums & detailed metadata",
                "Add tracks directly to your Spotify queue",
                "Secure OAuth2 authentication",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-4 py-3 text-base text-muted-foreground"
                >
                  <Check className="h-5 w-5 flex-shrink-0 text-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div>
                    <p className="font-semibold text-sm">
                      Connected to Spotify
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Premium account
                    </p>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      Library tracks
                    </span>
                    <span className="font-semibold text-sm">2,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      Playlists
                    </span>
                    <span className="font-semibold text-sm">34</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      Followed artists
                    </span>
                    <span className="font-semibold text-sm">182</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-8 py-32 text-center">
        <h2 className="mb-6 font-semibold tracking-tight text-[clamp(2.5rem,8vw,6rem)] leading-none">
          Ready to queue together?
        </h2>
        <p className="mx-auto mb-12 max-w-[600px] text-muted-foreground text-xl leading-relaxed">
          Build a queue with friends and discover your next favorite track.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Form method="post" className="w-full max-w-sm">
            <input type="hidden" name="mode" value="authorize" />
            <input type="hidden" name="provider" value="spotify" />
            <Button type="submit" size="lg" className="gap-3">
              <img
                src="/spotify/icon-black.png"
                alt="Spotify"
                className="h-6 w-6"
              />
              <span>Start with Spotify</span>
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const cloned = request.clone();
  const data = await request.formData();
  const mode = data.get("mode");
  if (typeof mode !== "string") throw new Error("mode not found");

  if (mode === "authorize") {
    const provider = data.get("provider");
    if (typeof provider !== "string") throw new Error("invalid data");
    await authenticator.authenticate(provider, cloned as Request);
  }
}
