import { Router } from 'express';
import { AppointmentBookingAgentWithTools } from '../../agents/text-to-text/appointment-agent-with-tools';

const router = Router();

// Store agent instances per session (in production, use proper session management)
const agentSessions = new Map<string, AppointmentBookingAgentWithTools>();

// POST /api/chat - Send message to agent
router.post('/', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`💬 Chat API: Received message from session ${sessionId}: "${message}"`);

    // Get or create agent for this session
    let agent = agentSessions.get(sessionId);
    if (!agent) {
      agent = new AppointmentBookingAgentWithTools();
      agentSessions.set(sessionId, agent);
      console.log(`💬 Created new agent session: ${sessionId}`);
    }

    // Send message to agent
    const response = await agent.sendMessage(message);
    
    console.log(`💬 Agent response: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`);

    res.json({ 
      response,
      sessionId 
    });

  } catch (error) {
    console.error('💬 Chat API error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/chat/reset - Reset conversation
router.post('/reset', (req, res) => {
  const { sessionId = 'default' } = req.body;
  
  const agent = agentSessions.get(sessionId);
  if (agent) {
    agent.resetConversation();
    console.log(`💬 Reset conversation for session: ${sessionId}`);
  }
  
  res.json({ message: 'Conversation reset successfully' });
});

// GET /api/chat/sessions - Get active sessions (for debugging)
router.get('/sessions', (req, res) => {
  const sessions = Array.from(agentSessions.keys());
  res.json({ sessions, count: sessions.length });
});

export default router;