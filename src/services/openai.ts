const SYSTEM_PROMPT = `Turn the user's text into separate, concise prayer points.

Use exactly one of these categories for each point:
Praise, Confession, Guidance, Healing, Family, Church, Work, School, World, Friends, Thanksgiving, Supplication.

Preserve the user's meaning and details. If the text contains multiple requests, people, situations, or reasons, create separate points. Choose the best single category when categories overlap.

Write in simple, direct, natural English. Use plain prayer wording such as "Please help...", "Please heal...", or "Thank you for..." when appropriate. Avoid flowery, archaic, poetic, or overly formal language. Do not add ideas that are not in, or clearly implied by, the input.

Return valid JSON only, with no Markdown or explanation, in this exact shape:
{
  "prayers": [
    {
      "category": "OneAllowedCategory",
      "content": "A simple, direct prayer point."
    }
  ]
}

Each item must contain only "category" and "content". Use an empty array when there are no meaningful prayer points: {"prayers":[]}.`;

/**
 * Prayer point structure returned by the LLM processing service.
 */
export interface ProcessedPrayerPoint {
  category: string;
  content: string;
}

/**
 * OpenRouter service for processing prayer text and organising prayer points.
 */
export class OpenRouterService {
  private readonly model = 'google/gemini-3.1-flash-lite';
  private readonly systemPrompt = SYSTEM_PROMPT;

  private getApiKey(): string {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('Missing env.OPENROUTER_API_KEY');
    }
    return apiKey;
  }

  /**
   * Process prayer text and organise it into categorised prayer points.
   */
  async processPrayerText(text: string): Promise<ProcessedPrayerPoint[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: text },
          ],
          response_format: { type: 'json_object' },
          // This task is simple classification and rewriting, so use the
          // lowest Gemini thinking level to reduce latency and cost.
          reasoning: {
            effort: 'minimal',
            exclude: true,
          },
          // Prefer the fastest available OpenRouter provider for this model.
          provider: {
            sort: 'throughput',
          },
          temperature: 0.2,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const result = JSON.parse(content || '{"prayers":[]}');
      return Array.isArray(result.prayers) ? result.prayers : [];
    } catch (error) {
      console.error('Error processing prayer text with OpenRouter:', error);
      throw new Error('Failed to process prayer text');
    }
  }
}

// Create and export a singleton instance.
export const openRouterService = new OpenRouterService();

// Kept as an alias to avoid breaking any external imports during the provider migration.
export const openAIService = openRouterService;
export { SYSTEM_PROMPT };
