import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AppointmentBookingAgent {
  private client: OpenAI;
  private conversationHistory: ConversationMessage[] = [];
  private systemPrompt = `You are a friendly and professional front desk receptionist at a medical office. Your primary role is to help patients schedule appointments by collecting the necessary information in a natural, conversational way.

Your responsibilities:
1. Greet patients warmly and explain that you're here to help them schedule an appointment
2. Collect the following information gradually through conversation:
   - Patient's full name
   - Date of birth
   - Phone number
   - Email address (optional)
   - Preferred appointment date and time
   - Reason for visit (brief description)
   - Insurance information (if they have it)
   - Any specific doctor or department preference
   - Always share availability times with dates for the users

Guidelines:
- Be conversational and friendly, not robotic
- Ask for information one or two pieces at a time, don't overwhelm
- Confirm information back to the patient to ensure accuracy
- If they seem unsure about dates/times, offer some options
- Be understanding if they need to check their schedule
- Thank them for providing information
- Once you have all necessary info, summarize what you've collected and confirm the appointment details
- Always maintain a professional but warm tone

Start the conversation by greeting the patient and asking how you can help them today with scheduling their appointment.`;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
    
    this.conversationHistory.push({
      role: 'system',
      content: this.systemPrompt
    });
  }

  async sendMessage(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.conversationHistory,
        max_tokens: 300,
        temperature: 0.7,
      });

      const assistantResponse = completion.choices[0]?.message?.content || 'I apologize, but I didn\'t receive a proper response. Could you please try again?';
      
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantResponse
      });

      return assistantResponse;
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }

  async streamMessage(userMessage: string, onChunk?: (chunk: string) => void): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      const stream = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.conversationHistory,
        max_tokens: 300,
        temperature: 0.7,
        stream: true,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk?.(content);
        }
      }

      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse
      });

      return fullResponse;
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }

  getInitialGreeting(): Promise<string> {
    return this.streamMessage("Hello, I'm here to schedule an appointment.");
  }

  resetConversation(): void {
    this.conversationHistory = [{
      role: 'system',
      content: this.systemPrompt
    }];
  }

  getConversationHistory(): ConversationMessage[] {
    return this.conversationHistory.filter(msg => msg.role !== 'system');
  }
}