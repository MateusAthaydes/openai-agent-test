# 🤖 AI Agent Experience - Medical Appointment Booking

> A proof-of-concept demonstrating AI agent integration with Electronic Health Records (EHR) for seamless appointment booking across multiple interaction modalities.

![AI Agent Experience](https://img.shields.io/badge/AI-Powered-blue) ![OpenAI](https://img.shields.io/badge/OpenAI-Function%20Calling-green) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue) ![Express](https://img.shields.io/badge/Express-Server-red)

## 🌟 Features

### 🎯 **Multi-Modal AI Interactions**
- **Text-to-Text** ✅ - Real-time chat with AI appointment assistant
- **Text-to-Speech** 🚧 - Type messages, hear AI responses (Coming Soon)
- **Speech-to-Speech** 🚧 - Natural voice conversations (Coming Soon)

### 🏥 **EHR Integration**
- **Real-time data access** - Live integration with mock Electronic Health Records
- **Smart appointment booking** - AI agent with access to actual schedules and availability
- **Patient management** - Create and manage patient records through conversation
- **Location & clinician lookup** - Real-time access to medical providers and locations
- **Real-time logging** - Watch AI agent interactions with EHR system in real-time

### 🛠️ **OpenAI Function Calling**
The AI agent is equipped with 5 powerful tools:
- `get_locations` - Fetch all medical office locations
- `get_clinicians` - Get doctors by location and specialty
- `check_availability` - Real-time appointment slot checking
- `create_patient` - Save patient information to EHR
- `create_appointment` - Book confirmed appointments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone and setup**
   ```bash
   git clone <your-repo>
   cd openai-agent-test
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env
   ```

3. **Start the servers**
   ```bash
   # Terminal 1: Start the EHR mock server + Web interface
   npm run server
   
   # Terminal 2 (optional): CLI version
   npm run text-to-text
   ```

4. **Open the web interface**
   ```
   http://localhost:3001
   ```

## 🎮 Usage

### Web Interface
1. Visit `http://localhost:3001`
2. Select "Text to Text" experience
3. Click "Start Text Chat"
4. **Watch the magic happen**: Real-time logs on the left show exactly what the AI is doing!
5. Ask the AI about:
   - "What locations do you have?"
   - "Show me doctors in Brooklyn"
   - "I need to schedule an appointment"
   - "Check availability for Dr. Sarah Johnson next Tuesday"

**Pro tip**: Toggle the log panel with the 📊 button to focus on the chat or see both sides!

### CLI Interface
```bash
npm run text-to-text
> What locations are available?
> I need to book an appointment with a cardiologist
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Interface │    │   AI Agent      │    │   Mock EHR      │
│                 │    │                 │    │                 │
│ • Chat UI       │◄──►│ • OpenAI GPT    │◄──►│ • Locations     │
│ • Experience    │    │ • Function      │    │ • Clinicians    │
│   Selection     │    │   Calling       │    │ • Availability  │
│                 │    │ • Conversation  │    │ • Appointments  │
└─────────────────┘    │   Memory        │    │ • Patients      │
                       └─────────────────┘    └─────────────────┘
```

### Project Structure
```
src/
├── agents/
│   └── text-to-text/           # AI Agent implementation
│       ├── appointment-agent-with-tools.ts
│       ├── ehr-client.ts
│       └── demo.ts
├── server/                     # EHR Mock Server
│   ├── server.ts
│   ├── routes/                 # API endpoints
│   ├── types/                  # TypeScript interfaces
│   └── data/                   # Mock data generators
└── web/
    └── public/                 # Web interface
        ├── index.html          # Landing page
        ├── chat.html           # Chat interface
        └── *.css, *.js         # Styling & interactions
```

## 📊 **Real-Time System Logs**

The web interface features a live log panel that shows exactly what's happening behind the scenes:

### **What You'll See:**
- **🌐 HTTP Requests**: Every GET, POST request with headers, body, and response details
- **🔍 EHR API Calls**: Watch the AI fetch locations, doctors, and availability in real-time
- **🤖 OpenAI Function Calls**: See which tools the AI decides to use and when
- **💾 Data Operations**: Live view of patient records and appointments being created
- **📡 WebSocket Events**: Connection status and real-time communication
- **⚡ Performance Metrics**: Response times, data sizes, and operation success/failure
- **🏥 Database Operations**: See clinicians filtered by location, availability checks
- **🔧 Server Lifecycle**: Startup, initialization, and configuration events

### **Log Categories:**
- `HTTP` - All incoming requests and outgoing responses
- `CHAT` - User messages and conversation flow
- `AI_AGENT` - OpenAI processing and responses  
- `EHR_API` - Database operations and API calls
- `CLINICIANS` - Doctor lookup and filtering operations
- `LOCATIONS` - Medical facility operations
- `AVAILABILITY` - Schedule and time slot operations
- `WEBSOCKET` - Real-time connection events
- `SESSION` - User session management
- `SERVER` - System startup and configuration
- `DATABASE` - Data initialization and mock setup

### **Controls:**
- **📊 Toggle Button**: Hide/show log panel (header button)
- **Clear Button**: Reset logs while keeping system running
- **Auto-scroll**: Always shows latest activity
- **Color Coding**: Green=Success, Blue=Info, Orange=Warning, Red=Error

Perfect for demos, debugging, and understanding how AI agents really work!

## 🔧 API Endpoints

### EHR Mock Server
- `GET /api/locations` - Get all medical locations
- `GET /api/clinicians` - Get all clinicians
- `GET /api/clinicians/location/:id` - Get clinicians by location
- `GET /api/availability/:clinicianId/:date` - Check appointment slots
- `POST /api/patients` - Create patient record
- `POST /api/appointments` - Book appointment

### Chat API
- `POST /api/chat` - Send message to AI agent
- `POST /api/chat/reset` - Reset conversation

### Health & Web
- `GET /health` - Server health check
- `GET /` - Web interface

## 🧪 Example Conversations

### Booking an Appointment
```
User: Hi, I need to schedule an appointment
AI: Hello! I'd be happy to help you schedule an appointment. 
    Let me start by showing you our available locations...
    
    [AI automatically calls get_locations tool]
    
    We have 3 locations:
    • Downtown Medical Center (123 Main Street, New York)
    • Westside Health Clinic (456 Oak Avenue, New York)  
    • Brooklyn Family Practice (789 Brooklyn Bridge Blvd, Brooklyn)
    
    Which location would work best for you?

User: Brooklyn sounds good
AI: Great choice! Let me show you the doctors available at Brooklyn Family Practice...
    
    [AI calls get_clinicians tool with location filter]
    
    At Brooklyn Family Practice, we have:
    • Dr. Lisa Thompson - Family Medicine
    
    Would you like to see Dr. Thompson's availability?
```

### Checking Availability
```
User: What times does Dr. Sarah Johnson have available next Monday?
AI: Let me check Dr. Sarah Johnson's availability for Monday...
    
    [AI calls check_availability tool]
    
    Dr. Sarah Johnson has these available slots on 2024-01-15:
    • 9:00 AM - 9:30 AM
    • 10:30 AM - 11:00 AM  
    • 2:00 PM - 2:30 PM
    • 3:30 PM - 4:00 PM
    
    Which time works best for you?
```

## 🛠️ Development

### Available Scripts
```bash
npm run server          # Start EHR server + web interface
npm run text-to-text    # CLI chat interface
npm run build           # Build TypeScript
npm run dev             # Development mode
```

### Adding New Tools
1. Add function to `ehr-client.ts`
2. Define tool schema in `appointment-agent-with-tools.ts`
3. Add handler in `handleToolCall` method
4. Test with web interface

### Mock Data
- **5 Clinicians** across 3 locations with different specialties
- **Dynamic time slots** with realistic availability
- **Console logging** for all EHR operations
- **In-memory storage** for demo purposes

## 🔮 Future Roadmap

### Phase 2: Text-to-Speech
- Integrate OpenAI TTS API
- Add voice playback to web interface
- Maintain conversation flow with audio responses

### Phase 3: Speech-to-Speech  
- Add OpenAI Whisper for speech recognition
- Implement real-time voice conversations
- WebRTC integration for seamless audio

### Phase 4: Production Features
- Real EHR system integration
- User authentication & sessions
- Advanced scheduling logic
- Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT models and function calling capabilities
- **Express.js** for robust server framework
- **TypeScript** for type-safe development
- Modern chat UI inspired by WhatsApp, Telegram, and iMessage

---

**Built with ❤️ for the future of AI-powered healthcare interactions**

🚀 **Try it live**: `npm run server` → `http://localhost:3001`