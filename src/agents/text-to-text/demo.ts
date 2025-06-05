import { AppointmentBookingAgentWithTools } from './appointment-agent-with-tools';
import * as readline from 'readline';

class AppointmentBookingChat {
  private agent: AppointmentBookingAgentWithTools;
  private rl: readline.Interface;

  constructor() {
    this.agent = new AppointmentBookingAgentWithTools();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async start() {
    console.log('🏥 Medical Office Appointment Booking System (With Real-Time Data)');
    console.log('Welcome! I\'m here to help you schedule your appointment.');
    console.log('I can access real locations, clinicians, and availability!');
    console.log('Commands: /exit, /quit, /clear, /reset');
    console.log('='.repeat(70));

    try {
      console.log('\n🏥 Hello! I\'m your appointment booking assistant. I can help you find locations, doctors, check availability, and schedule appointments. How can I help you today?');
      await this.chatLoop();
    } catch (error) {
      console.error('\nError:', error);
      console.log('\nMake sure to:');
      console.log('1. Copy .env.example to .env');
      console.log('2. Add your OpenAI API key to .env');
    } finally {
      this.rl.close();
    }
  }

  private async chatLoop(): Promise<void> {
    return new Promise((resolve) => {
      const askQuestion = () => {
        this.rl.question('\n> ', async (input) => {
          const trimmedInput = input.trim();

          if (trimmedInput === '/exit' || trimmedInput === '/quit') {
            console.log('Goodbye! 👋');
            resolve();
            return;
          }

          if (trimmedInput === '/clear') {
            console.clear();
            console.log('🏥 Medical Office Appointment Booking System (With Real-Time Data)');
            console.log('Welcome! I\'m here to help you schedule your appointment.');
            console.log('I can access real locations, clinicians, and availability!');
            console.log('='.repeat(70));
            askQuestion();
            return;
          }

          if (trimmedInput === '/reset') {
            this.agent.resetConversation();
            console.log('\n🏥 Conversation reset. Starting fresh...');
            console.log('🏥 Hello! I\'m your appointment booking assistant. I can help you find locations, doctors, check availability, and schedule appointments. How can I help you today?');
            askQuestion();
            return;
          }

          if (!trimmedInput) {
            console.log('Please enter a message or use /exit to quit.');
            askQuestion();
            return;
          }

          try {
            console.log('\n🏥 ');
            const response = await this.agent.streamMessage(
              trimmedInput,
              (chunk) => process.stdout.write(chunk)
            );
            console.log('\n');
          } catch (error) {
            console.error('Error getting response:', error);
          }

          askQuestion();
        });
      };

      askQuestion();
    });
  }

  close() {
    this.rl.close();
  }
}

async function main() {
  const chat = new AppointmentBookingChat();
  
  process.on('SIGINT', () => {
    console.log('\nGoodbye! 👋');
    chat.close();
    process.exit(0);
  });

  await chat.start();
}

if (require.main === module) {
  main();
}