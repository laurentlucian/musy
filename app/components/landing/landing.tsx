import {
  ArrowRight,
  ChartNoAxesCombined,
  History,
  ListMusic,
} from "lucide-react";
import { Form, Link, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import "./landing.css";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const activity = [38, 56, 45, 70, 51, 85, 67, 94, 73, 60, 80, 100];
const features = [
  {
    icon: ChartNoAxesCombined,
    title: "Find your patterns.",
    copy: "Top tracks, favorite artists, and the habits behind every play.",
  },
  {
    icon: History,
    title: "Keep your history.",
    copy: "Import your Spotify history. See how your taste changes over time.",
  },
  {
    icon: ListMusic,
    title: "Listen together.",
    copy: "Bring your friends into a shared queue. Make room for their next favorite.",
  },
];

export function Landing({ signedIn = false }: { signedIn?: boolean }) {
  const navigation = useNavigation();
  const connecting =
    navigation.state !== "idle" &&
    navigation.formData?.get("provider") === "spotify";

  return (
    <div className="landing">
      <a href="#landing-main" className="skip-link">
        Skip to content
      </a>
      <header className="landing-header landing-width">
        <Link to="/landing" className="landing-brand" aria-label="Musy home">
          <img src="/logo/musy-128.png" alt="" width="36" height="36" />
          <span>Musy</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#features">Why Musy</a>
          <Button asChild variant="secondary" size="sm">
            <Link to="/profile">
              Open app <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </nav>
      </header>
      <main id="landing-main" className="landing-width" tabIndex={-1}>
        <section className="landing-hero" aria-labelledby="landing-title">
          <p className="landing-eyebrow">
            <span /> Your music, in perspective
          </p>
          <h1 id="landing-title">
            There’s more to
            <br />
            your music.
          </h1>
          <div className="landing-intro">
            <p>
              Get to know the music that makes you.
              <br className="landing-desktop-break" /> Your listening habits,
              lifelong favorites, and next shared obsession.
            </p>
            <div className="landing-cta">
              {signedIn ? (
                <Button asChild size="lg">
                  <Link to="/profile">
                    Open your Musy <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <Form method="post" action="/?index">
                  <input type="hidden" name="mode" value="authorize" />
                  <input type="hidden" name="provider" value="spotify" />
                  <Button type="submit" size="lg" disabled={connecting}>
                    <img
                      src="/spotify/icon-black.png"
                      alt=""
                      width="20"
                      height="20"
                    />
                    {connecting ? "Connecting…" : "Continue with Spotify"}
                  </Button>
                </Form>
              )}
              <span>Made for the way you listen.</span>
            </div>
          </div>
        </section>
        <figure
          className="landing-preview"
          aria-label="Example Musy listening overview with sample data"
        >
          <div className="preview-topbar">
            <span>
              <img src="/logo/musy-128.png" alt="" width="24" height="24" />{" "}
              Musy <span className="preview-divider">/</span> Overview
            </span>
            <span>
              Sample listening year <span className="preview-status" />
            </span>
          </div>
          <div className="preview-body">
            <div className="preview-stats">
              <div>
                <span>Plays</span>
                <strong>12,486</strong>
                <small>A year on repeat</small>
              </div>
              <div>
                <span>Listening time</span>
                <strong>
                  38,920<em> min</em>
                </strong>
                <small>Time well spent</small>
              </div>
              <div>
                <span>Different tracks</span>
                <strong>2,147</strong>
                <small>Old favorites. New finds.</small>
              </div>
              <div>
                <span>Active days</span>
                <strong>
                  328<em> / 365</em>
                </strong>
                <small>A little music, almost every day</small>
              </div>
            </div>
            <div className="preview-chart-heading">
              <span>Listening over time</span>
              <span>Every play tells a story</span>
            </div>
            <div className="preview-chart" aria-hidden="true">
              {months.map((month, index) => (
                <div key={month}>
                  <div className="preview-bar-track">
                    <span style={{ height: `${activity[index]}%` }} />
                  </div>
                  <small>{month}</small>
                </div>
              ))}
            </div>
          </div>
          <figcaption>Your listening, at a glance. Sample data.</figcaption>
        </figure>
        <section
          id="features"
          className="landing-features"
          aria-label="Why Musy"
        >
          {features.map(({ icon: Icon, title, copy }) => (
            <article key={title}>
              <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
        </section>
      </main>
      <footer className="landing-footer landing-width">
        <span>
          Musy <span>For the love of listening.</span>
        </span>
        <span>
          Connect with{" "}
          <img
            src="/spotify/wordmark-white.png"
            alt="Spotify"
            width="70"
            height="21"
          />
        </span>
      </footer>
    </div>
  );
}

export const landingMeta = () => [
  { title: "Musy — There’s more to your music" },
  {
    name: "description",
    content:
      "Get to know your music with Musy. Explore your Spotify listening habits, import your history, and listen together with shared queues.",
  },
  { property: "og:title", content: "Musy — There’s more to your music" },
  {
    property: "og:description",
    content:
      "Your listening habits, lifelong favorites, and next shared obsession.",
  },
  { property: "og:type", content: "website" },
  { tagName: "link", rel: "canonical", href: "https://musy.olaurent.com/" },
];
