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
        src={
          white ? "/spotity/wordmark-white.png" : "/spotity/wordmark-black.png"
        }
      />
    </button>
  );
};
export default SpotifyLogo;
