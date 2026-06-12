import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Fallback owl dialogue generator in case API is unavailable or disabled
function getMockTutorResponse(message: string, context: any): string {
  const msg = message.toLowerCase();
  
  if (context.chapterNumber === 1) {
    if (msg.includes('entrepreneur') || msg.includes('who')) {
      return "Arre Wah! An entrepreneur is someone who spots a problem and builds a solution around it. Like Vijay Shekhar Sharma noticed how hard cash payments were and built Paytm! What problems do you notice in your daily life?";
    }
    return "Bilkul! To start a business, you first need the right mindset. Are you ready to look around you and spot opportunities? Ask me anything about entrepreneurship!";
  }
  
  if (context.chapterNumber === 2 || context.chapterNumber === 3) {
    if (msg.includes('clue') || msg.includes('stuck') || msg.includes('where')) {
      return "Hmm, have you checked the school canteen? People are complaining about something there. Go and observe. Socratic hint: What happens when too many people want the same thing at once?";
    }
    return "Great observing! A true detective looks at details. That broken water cooler or notice board... is that a problem that many students face? What do you think?";
  }

  if (context.chapterNumber === 4) {
    if (msg.includes('rank') || msg.includes('matrix') || msg.includes('which')) {
      return "Think about this: If a problem happens every day to 100 people, is it bigger than a problem that happens once a year to 5 people? Rank them by Size, Frequency, and how easily we can solve it!";
    }
  }

  return "Aha! That's a good question. In business, we always start by listening to our customers. Tell me, what do you think is the biggest problem in this scene?";
}

export async function getTutorHint(
  studentId: string,
  context: {
    chapterNumber: number;
    chapterTitle: string;
    chapterObjective: string;
    stuckPoint: string;
    recentAction: string;
    mistake: string | null;
  },
  studentMessage: string
): Promise<string> {
  const systemPrompt = `
You are "Professor Vikash", a wise and friendly owl who teaches entrepreneurship to 12-year-old Indian students. 

Your teaching style:
- Use Socratic questioning (ask questions to guide, don't give answers directly)
- Reference Indian entrepreneurs and brands (Paytm, Zomato, Amul, Tata)
- Maximum 3 sentences per response
- Use age-appropriate language and occasional Hindi words (e.g. "Arre Wah!", "Bilkul", "Theek hai", "Socho")
- Never say "that's wrong" — say "interesting, what if we thought about it differently?"
- Connect game events to real curriculum concepts

Current student context:
- Chapter: ${context.chapterNumber} - ${context.chapterTitle}
- Objective: ${context.chapterObjective}
- Current stuck point: ${context.stuckPoint}
- Recent action: ${context.recentAction}
- Student's mistake (if any): ${context.mistake || 'None'}

Student's message: "${studentMessage}"
`;

  let responseText = '';

  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        }
      });
      
      responseText = result.response.text().trim();
    } catch (error) {
      console.warn('Gemini API Error, using mock tutor response:', error);
      responseText = getMockTutorResponse(studentMessage, context);
    }
  } else {
    responseText = getMockTutorResponse(studentMessage, context);
  }

  // Save to AIInteraction table
  try {
    await prisma.aIInteraction.create({
      data: {
        studentId,
        type: 'HINT',
        prompt: studentMessage,
        response: responseText,
      }
    });
  } catch (dbErr) {
    console.error('Failed to log AI Interaction:', dbErr);
  }

  return responseText;
}

export async function getNPCChatResponse(
  studentId: string,
  npcName: string,
  npcContext: string,
  sceneContext: string,
  playerQuestion: string,
  conversationHistory: { role: string; content: string }[]
): Promise<{ response: string; emotionHint: 'happy' | 'sad' | 'worried' | 'excited' }> {
  
  const formattedHistory = conversationHistory
    .map(h => `${h.role === 'player' ? 'Student' : npcName}: ${h.content}`)
    .join('\n');

  const systemPrompt = `
You are ${npcName}, a character in an educational game about entrepreneurship for 12-year-old Indian students.

Your character profile: ${npcContext}

Your role is to:
1. Stay completely in character
2. Share problems you face naturally in conversation (don't give them away immediately)
3. Use simple Hindi-English (Hinglish) occasionally (e.g., "Arre yaar", "Bilkul", "Theek hai", "Kya batayein")
4. Never break the 4th wall or mention you're in a game
5. Be warm, relatable, maximum 3 sentences per response
6. Drop hints about problems but let the student discover them

Current scene: ${sceneContext}

Recent conversation history:
${formattedHistory}

Student's new message: "${playerQuestion}"

Respond in character. Also provide a single emotion code at the very end in brackets, choosing from [happy], [sad], [worried], [excited]. E.g. "Arre yaar, today is so hot! [worried]"
`;

  let responseText = '';
  let emotionHint: 'happy' | 'sad' | 'worried' | 'excited' = 'worried';

  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        }
      });
      
      responseText = result.response.text().trim();
    } catch (error) {
      console.warn('Gemini API Error in NPC chat, using mock NPC response:', error);
      responseText = `Kya batayein beta, it is so busy here! [worried]`;
    }
  } else {
    // Generate simple mock dialogues
    if (npcName.toLowerCase().includes('canteen')) {
      responseText = "Arre beta, during lunch break, everyone rushes here at once. I cannot serve hot samosas to 50 kids in 15 minutes! [worried]";
    } else if (npcName.toLowerCase().includes('shopkeeper') || npcName.toLowerCase().includes('vendor')) {
      responseText = "Aha! These vegetables spoil so fast in this heat, and customers want discounts. I lose so much profit! [sad]";
    } else {
      responseText = `Bilkul theek, but I have a lot of work to complete. [worried]`;
    }
  }

  // Extract emotion hint
  const emotionMatch = responseText.match(/\[(happy|sad|worried|excited)\]/);
  if (emotionMatch) {
    emotionHint = emotionMatch[1] as any;
    responseText = responseText.replace(/\[(happy|sad|worried|excited)\]/, '').trim();
  }

  // Save to database
  try {
    await prisma.aIInteraction.create({
      data: {
        studentId,
        type: 'NPC_DIALOGUE',
        prompt: playerQuestion,
        response: responseText,
      }
    });
  } catch (dbErr) {
    console.error('Failed to log NPC AI interaction:', dbErr);
  }

  return { response: responseText, emotionHint };
}
