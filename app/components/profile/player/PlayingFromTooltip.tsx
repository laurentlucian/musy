import { decodeHtmlEntity } from "~/lib/utils";

type PlayingFromType = {
  description?: string;
  image?: string;
  name?: string;
};

const PlayingFromTooltip = ({ description, image, name }: PlayingFromType) => {
  return (
    <div className="stack-h-2 p-0">
      <img src={image} className="h-14 w-14" alt="playing" />
      <div className="stack-2 py-2">
        <p className="font-bold text-xs">{name}</p>
        <p className="text-xs italic">{decodeHtmlEntity(description)}</p>
      </div>
    </div>
  );
};

export default PlayingFromTooltip;
