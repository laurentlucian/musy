import useIsMobile from "~/hooks/useIsMobile";
import spotify_icon_black from "~/lib/assets/spotify_icon_black.png";
import spotify_icon_white from "~/lib/assets/spotify_icon_white.png";
import Spotify_Logo_Black from "~/lib/assets/Spotify_Logo_Black.png";
import Spotify_Logo_White from "~/lib/assets/Spotify_Logo_White.png";

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
  // const isSmallScreen = useIsMobile();

  // const spotifyIcon = useColorModeValue(
  //   isSmallScreen || white ? spotify_icon_white : spotify_icon_black,
  //   spotify_icon_white,
  // );
  // const spotifyLogo = useColorModeValue(
  //   isSmallScreen || white ? Spotify_Logo_White : Spotify_Logo_Black,
  //   Spotify_Logo_White,
  // );
  const spotify = icon ? spotify_icon_white : Spotify_Logo_White;

  return (
    <>
      <img
        alt="spotify-logo"
        style={{
          maxHeight: h,
          maxWidth: w,
          minHeight: h,
          minWidth: w,
        }}
        src={spotify}
        onClick={(e) => {
          if (link) {
            e.preventDefault();
            window.open("https://open.spotify.com");
          }
        }}
      />
    </>
  );
};
export default SpotifyLogo;
