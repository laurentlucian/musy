import Spotify_Logo_Black from "~/lib/assets/Spotify_Logo_Black.png";
import Spotify_Logo_White from "~/lib/assets/Spotify_Logo_White.png";
import spotify_icon_black from "~/lib/assets/spotify_icon_black.png";
import spotify_icon_white from "~/lib/assets/spotify_icon_white.png";

type SpotifyLogoProps = {
  h?: string;
  icon?: boolean;
  link?: boolean;
  w?: string;
  white?: boolean;
};

const SpotifyLogo = ({
  link = true,
  icon = false,
  h = "25px",
  w = icon ? "25px" : "80px",
  white,
}: SpotifyLogoProps) => {
  const spotify = icon ? spotify_icon_white : Spotify_Logo_White;

  return (
    <button
      type="button"
      onClick={(e) => {
        if (link) {
          e.preventDefault();
          window.open("https://open.spotify.com");
        }
      }}
    >
      <img
        alt="spotify-logo"
        style={{
          maxHeight: h,
          maxWidth: w,
          minHeight: h,
          minWidth: w,
        }}
        src={spotify}
      />
    </button>
  );
};
export default SpotifyLogo;
