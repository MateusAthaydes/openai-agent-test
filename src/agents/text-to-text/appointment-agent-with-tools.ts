import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { EHRClient } from './ehr-client';

dotenv.config();

type ConversationMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export class AppointmentBookingAgentWithTools {
  private client: OpenAI;
  private ehrClient: EHRClient;
  private conversationHistory: ConversationMessage[] = [];
  private systemPrompt = `You are a friendly and professional front desk receptionist at a medical office. Your primary role is to help patients schedule appointments by collecting the necessary information and using available tools to access real-time data.

Your responsibilities:
1. Greet patients warmly and explain that you're here to help them schedule an appointment
2. Use the available tools to get real information about:
   - Available locations and their details
   - Clinicians at each location and their specialties
   - Available appointment slots for specific clinicians and dates
   - Create patient records and appointments in the system

Guidelines:
- Be conversational and friendly, not robotic
- Use tools to provide accurate, real-time information
- Ask for information gradually through conversation
- Always use tools to check actual availability before suggesting times
- Use the create_patient tool to save patient information when you have enough details
- Use create_appointment to actually book the appointment when all details are confirmed
- Confirm information back to the patient to ensure accuracy
- Always maintain a professional but warm tone

Start the conversation by greeting the patient and asking how you can help them today with scheduling their appointment.`;

  private tools = [
    {
      type: "function" as const,
      function: {
        name: "get_locations",
        description: "Get all available medical office locations",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "get_clinicians",
        description: "Get all clinicians or clinicians at a specific location",
        parameters: {
          type: "object",
          properties: {
            locationId: {
              type: "string",
              description: "Optional location ID to filter clinicians by location"
            }
          },
          required: []
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "check_availability",
        description: "Check available appointment slots for a specific clinician on a specific date",
        parameters: {
          type: "object",
          properties: {
            clinicianId: {
              type: "string",
              description: "The ID of the clinician"
            },
            date: {
              type: "string",
              description: "The date in YYYY-MM-DD format"
            }
          },
          required: ["clinicianId", "date"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "create_patient",
        description: "Create a patient record in the system",
        parameters: {
          type: "object",
          properties: {
            firstName: {
              type: "string",
              description: "Patient's first name"
            },
            lastName: {
              type: "string",
              description: "Patient's last name"
            },
            dateOfBirth: {
              type: "string",
              description: "Patient's date of birth in YYYY-MM-DD format"
            },
            phone: {
              type: "string",
              description: "Patient's phone number"
            },
            email: {
              type: "string",
              description: "Patient's email address (optional)"
            },
            insurance: {
              type: "string",
              description: "Patient's insurance information (optional)"
            }
          },
          required: ["firstName", "lastName", "dateOfBirth", "phone"]
        }
      }
    },
    {
      type: "function" as const,
      function: {
        name: "create_appointment",
        description: "Create an appointment in the system",
        parameters: {
          type: "object",
          properties: {
            patientData: {
              type: "object",
              description: "Patient information object",
              properties: {
                id: { type: "string" },
                firstName: { type: "string" },
                lastName: { type: "string" },
                dateOfBirth: { type: "string" },
                phone: { type: "string" },
                email: { type: "string" },
                insurance: { type: "string" }
              },
              required: ["firstName", "lastName", "dateOfBirth", "phone"]
            },
            clinicianId: {
              type: "string",
              description: "The ID of the clinician"
            },
            locationId: {
              type: "string",
              description: "The ID of the location"
            },
            timeSlotId: {
              type: "string",
              description: "The ID of the selected time slot"
            },
            reason: {
              type: "string",
              description: "Reason for the appointment"
            }
          },
          required: ["patientData", "clinicianId", "locationId", "timeSlotId", "reason"]
        }
      }
    }
  ];

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
    this.ehrClient = new EHRClient();
    
    this.conversationHistory.push({
      role: 'system',
      content: this.systemPrompt
    } as OpenAI.Chat.Completions.ChatCompletionSystemMessageParam);
  }

  private async handleToolCall(toolCall: any): Promise<string> {
    const { name, arguments: args } = toolCall.function;
    const parsedArgs = JSON.parse(args);

    try {
      switch (name) {
        case 'get_locations':
          const locations = await this.ehrClient.getLocations();
          return JSON.stringify(locations);

        case 'get_clinicians':
          const clinicians = parsedArgs.locationId 
            ? await this.ehrClient.getCliniciansByLocation(parsedArgs.locationId)
            : await this.ehrClient.getClinicians();
          return JSON.stringify(clinicians);

        case 'check_availability':
          const availability = await this.ehrClient.getAvailability(
            parsedArgs.clinicianId, 
            parsedArgs.date
          );
          return JSON.stringify(availability);

        case 'create_patient':
          const patientResult = await this.ehrClient.createPatient(parsedArgs);
          return JSON.stringify(patientResult);

        case 'create_appointment':
          const appointmentResult = await this.ehrClient.createAppointment({
            patient: parsedArgs.patientData,
            clinicianId: parsedArgs.clinicianId,
            locationId: parsedArgs.locationId,
            timeSlotId: parsedArgs.timeSlotId,
            reason: parsedArgs.reason
          });
          return JSON.stringify(appointmentResult);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return JSON.stringify({ error: `Tool execution failed: ${error}` });
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    } as OpenAI.Chat.Completions.ChatCompletionUserMessageParam);

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.conversationHistory,
        tools: this.tools,
        tool_choice: 'auto',
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantMessage = completion.choices[0]?.message;
      if (!assistantMessage) {
        throw new Error('No response from OpenAI');
      }

      // Handle tool calls if present
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Add assistant message with tool calls
        this.conversationHistory.push({
          role: 'assistant',
          content: assistantMessage.content || '',
          tool_calls: assistantMessage.tool_calls
        } as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam);

        // Execute each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          const toolResult = await this.handleToolCall(toolCall);
          
          this.conversationHistory.push({
            role: 'tool',
            content: toolResult,
            tool_call_id: toolCall.id
          } as OpenAI.Chat.Completions.ChatCompletionToolMessageParam);
        }

        // Get final response after tool execution
        const finalCompletion = await this.client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: this.conversationHistory,
          tools: this.tools,
          tool_choice: 'auto',
          max_tokens: 500,
          temperature: 0.7,
        });

        const finalResponse = finalCompletion.choices[0]?.message?.content || 'I apologize, but I encountered an issue processing your request.';
        
        this.conversationHistory.push({
          role: 'assistant',
          content: finalResponse
        } as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam);

        return finalResponse;
      } else {
        // No tool calls, just add the response
        const response = assistantMessage.content || 'I apologize, but I didn\'t receive a proper response. Could you please try again?';
        
        this.conversationHistory.push({
          role: 'assistant',
          content: response
        } as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam);

        return response;
      }
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }

  async streamMessage(userMessage: string, onChunk?: (chunk: string) => void): Promise<string> {
    // For simplicity, use non-streaming with tools for now
    // Streaming with function calling is more complex
    const response = await this.sendMessage(userMessage);
    
    // Simulate streaming by sending the response in chunks
    if (onChunk) {
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? '' : ' ') + words[i];
        onChunk(chunk);
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for effect
      }
    }
    
    return response;
  }

  getInitialGreeting(): Promise<string> {
    return this.sendMessage("Hello, I'm here to schedule an appointment. Please help me get started.");
  }

  resetConversation(): void {
    this.conversationHistory = [{
      role: 'system',
      content: this.systemPrompt
    } as OpenAI.Chat.Completions.ChatCompletionSystemMessageParam];
  }

  getConversationHistory(): ConversationMessage[] {
    return this.conversationHistory.filter(msg => msg.role !== 'system');
  }
}