import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';

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
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing env.OPENAI_API_KEY');
    }

    this.model = "gpt-5-nano";

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Load system prompt from file
    this.systemPrompt = readFileSync(
      join(process.cwd(), 'src', 'utils', 'openaiSystemPrompt.txt'),
      'utf-8'
    );
  }

  /**
   * Process prayer text and organise it into categorized prayer points
   * @param text - The input text to process into prayer points
   * @returns Array of categorized prayer points
   */
  async processPrayerText(text: string): Promise<ProcessedPrayerPoint[]> {
    try {
      const response = await this.openai.chat.completions.create({
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
      });

      const result = JSON.parse(response.choices[0].message.content || '{"prayers": []}');
      return result.prayers || [];
    } catch (error) {
      console.error('Error processing prayer text with OpenAI:', error);
      throw new Error('Failed to process prayer text');
    }
  }
}

// Create and export a singleton instance
export const openAIService = new OpenAIService();
