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
import { cn } from "~/components/utils";
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
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1000] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Hero Section */}
      <section className="relative grid min-h-dvh grid-rows-[1fr_auto] overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-50%] left-[-50%] h-[200%] w-[200%] animate-float bg-[radial-gradient(ellipse_at_30%_20%,hsla(138,76%,47%,0.15)_0%,transparent_50%)]" />
          <div className="absolute right-[-50%] bottom-[-50%] h-[200%] w-[200%] animate-float-slow bg-[radial-gradient(ellipse_at_70%_80%,hsla(138,76%,55%,0.1)_0%,transparent_50%)]" />
        </div>

        <div className="mx-auto flex w-full max-w-[1400px] flex-col justify-center p-8">
          <p className="mb-4 animate-fade-in font-medium text-[hsl(138,76%,47%)] text-sm uppercase tracking-[0.1em] opacity-0 sm:text-base md:text-lg">
            Social Music Discovery
          </p>
          <h1 className="animation-delay-200 mb-6 animate-slide-up font-['Anton'] text-[clamp(3.5rem,12vw,10rem)] uppercase leading-[0.9] opacity-0">
            <span className="animate-shimmer bg-[length:200%_auto] bg-gradient-to-r from-[hsl(138,76%,47%)] via-[hsl(138,76%,55%)] to-[hsl(138,76%,47%)] bg-clip-text text-transparent">
              Queue
            </span>
            <br />
            Together
          </h1>
          <p className="animation-delay-400 mb-10 max-w-[600px] animate-fade-in text-base text-muted-foreground leading-relaxed opacity-0 sm:text-lg md:text-xl">
            Create collaborative music queues with friends. Discover tracks,
            share vibes, and let the music play — all powered by your Spotify
            library.
          </p>
          <div className="animation-delay-600 animate-fade-in opacity-0">
            <Form method="post" className="w-full max-w-sm">
              <input type="hidden" name="mode" value="authorize" />
              <input type="hidden" name="provider" value="spotify" />
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-full bg-[hsl(138,76%,47%)] px-10 py-4 font-semibold text-base text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[hsl(138,76%,55%)] hover:shadow-[0_10px_40px_hsla(138,76%,47%,0.4)] active:translate-y-0"
              >
                <img
                  src="/spotify/icon-white.png"
                  alt="Spotify"
                  className="h-6 w-6"
                />
                <span>Continue with Spotify</span>
              </button>
            </Form>
          </div>
        </div>

        <div className="animation-delay-1000 flex animate-fade-in flex-col items-center gap-2 p-8 opacity-0">
          <span className="text-[0.75rem] text-muted-foreground uppercase tracking-[0.2em]">
            Scroll to explore
          </span>
          <ChevronDown className="h-6 w-6 animate-bounce-slow text-[hsl(138,76%,47%)]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-8 py-32">
        <div className="mb-24 text-center">
          <p className="mb-4 font-semibold text-[0.75rem] text-[hsl(138,76%,55%)] uppercase tracking-[0.3em]">
            Features
          </p>
          <h2 className="mb-4 font-['Anton'] text-[clamp(2.5rem,6vw,5rem)] leading-none">
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
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-10 transition-all duration-500 hover:-translate-y-1 hover:border-[hsl(138,76%,47%)]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(138,76%,47%)]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute top-8 right-8 font-['Anton'] text-6xl text-[hsl(138,76%,47%)]/15 leading-none [-webkit-text-stroke:1px_hsla(138,76%,47%,0.2)]">
                {feature.number}
              </span>
              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(138,76%,47%)] to-[hsl(138,76%,55%)] text-white">
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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,hsla(138,76%,47%,0.08)_0%,transparent_50%)]" />
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 font-semibold text-[0.75rem] text-[hsl(138,76%,55%)] uppercase tracking-[0.3em]">
              Integration
            </p>
            <h2 className="mb-6 font-['Anton'] text-[clamp(2.5rem,5vw,4rem)] leading-[1.1]">
              Powered by
              <br />
              <span className="animate-shimmer bg-[length:200%_auto] bg-gradient-to-r from-[hsl(138,76%,47%)] via-[hsl(138,76%,55%)] to-[hsl(138,76%,47%)] bg-clip-text text-transparent">
                Spotify
              </span>
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
                  <Check className="h-5 w-5 flex-shrink-0 text-[hsl(138,76%,47%)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 p-8 backdrop-blur-xl">
              <div
                className="absolute top-[-50%] left-[-50%] h-[200%] w-[200%] animate-rotate-slow opacity-50"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%, hsla(138,76%,47%,0.15) 0deg, transparent 60deg, hsla(138,76%,55%,0.15) 120deg, transparent 180deg, hsla(138,76%,47%,0.15) 240deg, transparent 300deg)`,
                }}
              />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760]" />
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-[hsl(138,76%,47%)]/5 to-background" />
        <h2 className="mb-6 font-['Anton'] text-[clamp(2.5rem,8vw,6rem)] leading-none">
          Ready to queue together?
        </h2>
        <p className="mx-auto mb-12 max-w-[600px] text-muted-foreground text-xl leading-relaxed">
          Join thousands of music lovers collaborating on playlists and
          discovering their next favorite track.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Form method="post" className="w-full max-w-sm">
            <input type="hidden" name="mode" value="authorize" />
            <input type="hidden" name="provider" value="spotify" />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[hsl(138,76%,47%)] px-10 py-4 font-semibold text-base text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[hsl(138,76%,55%)] hover:shadow-[0_10px_40px_hsla(138,76%,47%,0.4)] active:translate-y-0"
            >
              <img
                src="/spotify/icon-white.png"
                alt="Spotify"
                className="h-6 w-6"
              />
              <span>Start with Spotify</span>
            </button>
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
