import OpenAI from 'openai';

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
  private openai: OpenAI;
  
  /**
   * Default prayer categories that the AI should use
   */
  private readonly defaultCategories = [
    'Praise', 
    'Thanksgiving', 
    'Confession', 
    'Supplication', 
    'Guidance', 
    'Protection', 
    'Healing', 
    'Family', 
    'Church', 
    'World'
  ];

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing env.OPENAI_API_KEY');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Process prayer text and organize it into categorized prayer points
   * @param text - The input text to process into prayer points
   * @returns Array of categorized prayer points
   */
  async processPrayerText(text: string): Promise<ProcessedPrayerPoint[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that organizes prayer points into categories. 
            Convert regular information into prayer format if needed.
            Categories should be one of: ${this.defaultCategories.join(', ')}.
            Return the response as a JSON array of objects with 'category' and 'content' properties.
            Example response format: {"prayers": [{"category": "Thanksgiving", "content": "Thank you for..."}]}`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"prayers": []}');
      return result.prayers || [];
    } catch (error) {
      console.error('Error processing prayer text with OpenAI:', error);
      throw new Error('Failed to process prayer text');
    }
  }

  /**
   * Get the list of supported prayer categories
   * @returns Array of category names
   */
  getCategories(): string[] {
    return [...this.defaultCategories];
  }

  /**
   * Process multiple prayer texts in batch
   * @param texts - Array of texts to process
   * @returns Array of arrays of processed prayer points
   */
  async processPrayerTextBatch(texts: string[]): Promise<ProcessedPrayerPoint[][]> {
    const promises = texts.map(text => this.processPrayerText(text));
    return Promise.all(promises);
  }
}

// Create and export a singleton instance
export const openAIService = new OpenAIService();
