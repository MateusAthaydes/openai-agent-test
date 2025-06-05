import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

export class OpenAIAgent {
  private client: OpenAI;
  
  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async textToText(
    prompt: string,
    model: string = 'gpt-3.5-turbo',
    maxTokens: number = 1000
  ): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }

  async streamTextToText(
    prompt: string,
    model: string = 'gpt-3.5-turbo',
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: 0.7,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk?.(content);
        }
      }

      return fullResponse;
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }
}