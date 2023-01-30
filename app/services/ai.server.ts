type TextCompletion = {
  choices: Choice[];
  created: number;
  id: string;
  model: string;
  object: string;
  usage: Usage;
};

type Choice = {
  finish_reason: string;
  index: number;
  logprobs: any | null;
  text: string;
};

type Usage = {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
};

export const askDaVinci = async (prompt: string) => {
  const res = await fetch('https://api.openai.com/v1/completions', {
    body: JSON.stringify({
      max_tokens: 500,
      model: 'text-davinci-003',
      prompt,
      temperature: 0.5,
      top_p: 1,
      // frequency_penalty: 0,
      // presence_penalty: 0,
      // stop: ['\
      // '],
    }),
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const json = (await res.json()) as TextCompletion;

  return json.choices[0].text;
};
