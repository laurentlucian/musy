type TextCompletion = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
};

type Choice = {
  text: string;
  index: number;
  logprobs: any | null;
  finish_reason: string;
};

type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export const askDaVinci = async (prompt: string) => {
  const res = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      model: 'text-davinci-003',
      max_tokens: 500,
      temperature: 0.5,
      top_p: 1,
      // frequency_penalty: 0,
      // presence_penalty: 0,
      // stop: ['\
      // '],
    }),
  });

  const json = (await res.json()) as TextCompletion;

  return json.choices[0].text;
};
