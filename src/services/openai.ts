import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env.OPENAI_API_KEY');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processPrayerText(text: string): Promise<Array<{ category: string; content: string }>> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that organizes prayer points into categories. 
        Convert regular information into prayer format if needed.
        Categories should be one of: Praise, Thanksgiving, Confession, Supplication, Guidance, Protection, Healing, Family, Church, World.
        Return the response as a JSON array of objects with 'category' and 'content' properties.`
      },
      {
        role: "user",
        content: text
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content || '{"prayers": []}');
  return result.prayers;
} 