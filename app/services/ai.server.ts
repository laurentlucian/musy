import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const askGPT = async (content: string) => {
  const completion = await openai.createChatCompletion({
    messages: [{ content, role: 'user' }],
    model: 'gpt-3.5-turbo',
  });

  return completion.data.choices[0].message?.content ?? 'No analysis found';
};

export const getAnalysis = async (track: SpotifyApi.SingleTrackResponse) => {
  const {
    name,
    artists: [{ name: artist }],
  } = track;
  const prompt = `Elaborate on songwriting, vocal, instrumental, production, bpm, genre, chords, and mixing detail for ${artist}'s ${name}`;

  return askGPT(prompt);
};
export const getMood = async (recent: SpotifyApi.UsersRecentlyPlayedTracksResponse) => {
  const tracks = recent.items.map((item) => ({
    album_name: item.track.album.name,
    artist_name: item.track.artists[0].name,
    song_name: item.track.name,
  }));

  const prompt = `Based on the songs given below, describe my current mood in one word. Choose fun and uncommon words. 
    ${JSON.stringify(tracks)}`;

  const response = (await askGPT(prompt)).split('.')[0];
  return response;
};

export const getStory = async (track: SpotifyApi.SingleTrackResponse) => {
  const {
    name,
    artists: [{ name: artist }],
  } = track;

  const prompt = `Based on the song ${name} by ${artist}, craft me a scenario. The scenario should be atmospheric, vivid, and transport the reader to a specific place and vibe. 
    Encourage ChatGPT to use descriptive language to help the reader imagine the setting, and to touch on the song's songwriting, vocal, instrumental, bpm, and genre in a way that enhances the environment.
    `;

  return askGPT(prompt);
};
