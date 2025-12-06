const SYSTEM_PROMPT = `You are a helpful assistant that organises text into individual categorised prayer points. Use simple language.
Categories should be one of: 'Praise', 'Confession', 'Guidance', 'Healing', 'Family', 'Church', 'Work', 'School', 'World', 'Friends', 'Thanksgiving', 'Supplication'. Each prayer point can only have one category. If multiple categories apply, pick one that matches best.
Return the response as a JSON array of objects with 'category' and 'content' properties.

Examples:

Example 1:
Input:
"My dog is sick"

Response:
{
  "prayers": [
    {
      "category": "Healing",
      "content": "Please heal my sick dog. Bring comfort and health to my pet."
    }
  ]
}

Example 2:
Input:
"National election is coming up"

Response:
{
  "prayers": [
    {
      "category": "World",
      "content": "Please help the election process to be smooth and fair."
    },
    {
      "category": "World",
      "content": "Please appoint a candidate who will perform his office justly, fairly, without corruption."
    }
  ]
}

Example 3:
Input:
"I passed my maths test on Friday"

Response:
{
  "prayers": [
    {
      "category": "School",
      "content": "Thank you for enabling me to pass my maths test on Friday."
    },
    {
      "category": "School",
      "content": "Please help me to retain the maths knowledge that I have learned."
    }
  ]
}
`;

/**
 * Prayer point structure returned by OpenAI processing
 */
export interface ProcessedPrayerPoint {
  category: string;
  content: string;
}

/**
 * OpenAI service for processing prayer text and organizing prayer points
 */
export class OpenAIService {
  private model: string;
  private apiKey: string;
  private systemPrompt: string;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing env.OPENAI_API_KEY');
    }

    this.model = "gpt-5-nano"; // Fixed model name
    this.apiKey = process.env.OPENAI_API_KEY;
    this.systemPrompt = SYSTEM_PROMPT;
  }

  /**
   * Process prayer text and organise it into categorized prayer points
   * @param text - The input text to process into prayer points
   * @returns Array of categorized prayer points
   */
  async processPrayerText(text: string): Promise<ProcessedPrayerPoint[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: this.systemPrompt
            },
            {
              role: "user",
              content: text
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content || '{"prayers": []}');
      return result.prayers || [];
    } catch (error) {
      console.error('Error processing prayer text with OpenAI:', error);
      throw new Error('Failed to process prayer text');
    }
  }
}

// Create and export a singleton instance
export const openAIService = new OpenAIService();
