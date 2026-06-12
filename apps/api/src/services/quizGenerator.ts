import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

// Load static fallback questions from quizzes.json
function getStaticQuestions(chapterNumber: number): QuizQuestion[] {
  try {
    const filePath = path.join(__dirname, '../data/quizzes.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const chQuestions = data.chapters[chapterNumber.toString()];
      if (chQuestions && chQuestions.length > 0) {
        return chQuestions;
      }
    }
  } catch (err) {
    console.error('Error reading static quizzes file:', err);
  }

  // hardcoded safety fallback if file reading fails
  return [
    {
      question: "What is the primary role of an entrepreneur?",
      options: [
        "Finding problems and solving them through a business",
        "Working in a fixed, low-risk job",
        "Avoiding any kind of financial responsibility",
        "Designing animated characters"
      ],
      correct: "Finding problems and solving them through a business",
      explanation: "Entrepreneurs take the initiative to discover real-world problems and construct solutions to address them."
    }
  ];
}

export async function generateQuizQuestions(
  studentId: string,
  chapterNumber: number,
  chapterTitle: string,
  gameContext: string
): Promise<QuizQuestion[]> {
  const cacheKey = `quiz:chapter:${chapterNumber}:student:${studentId}`;
  
  // Try to load cached questions first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn('Failed to retrieve quiz from cache:', err);
  }

  // Fallback list
  const fallbackQuestions = getStaticQuestions(chapterNumber);

  if (!GEMINI_API_KEY) {
    return fallbackQuestions;
  }

  const prompt = `
Generate 3 multiple choice questions for a Grade 7 Indian student (12 years old) who just completed a chapter in an entrepreneurship learning game.

Context:
- Chapter Number: ${chapterNumber}
- Chapter Title: ${chapterTitle}
- What they did in the game: ${gameContext}

Requirements:
- Each question must test practical application of concepts, not simple rote memory.
- Connect questions to decisions they made or real Indian business examples (like Paytm, Zomato, Amul).
- Provide exactly 4 options per question, with only 1 correct option.
- Include a clear 1-sentence explanation of why the correct option is right.
- Ensure the language is simple, age-appropriate, and encouraging.
- Return ONLY a valid JSON array of objects. Do not include markdown code block formatting (no \`\`\`json tags), just raw JSON string.
- Format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": "Option A",
    "explanation": "Explanation of the correct answer."
  }
]
`;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    const responseText = result.response.text().trim();
    // Strip codeblock indicators if Gemini outputted them despite instructions
    const cleanJSON = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(cleanJSON) as QuizQuestion[];

    if (Array.isArray(questions) && questions.length > 0) {
      // Cache questions in Redis for 24 hours (86400 seconds)
      await redis.set(cacheKey, JSON.stringify(questions), 86400);
      
      // Log to interactions
      await prisma.aIInteraction.create({
        data: {
          studentId,
          type: 'ASSESSMENT',
          prompt: `Generate quiz for chapter ${chapterNumber}`,
          response: cleanJSON
        }
      });
      
      return questions;
    }
  } catch (err) {
    console.warn('Failed to generate dynamic quiz with Gemini, using static fallback:', err);
  }

  return fallbackQuestions;
}
