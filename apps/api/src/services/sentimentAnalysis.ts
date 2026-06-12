import { HfInference } from '@huggingface/inference';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';

// Local simple profanity and negative sentiment filter as fallback
const PROFANITY_LIST = [
  'badword', 'abuse', 'stupid', 'idiot', 'useless', 'fool', 'hack', 'steal', 'cheat'
];

export async function analyzeSafetyAndSentiment(
  text: string
): Promise<{ isSafe: boolean; isPositive: boolean; score: number }> {
  const lowercaseText = text.toLowerCase();
  
  // 1. Basic profanity check
  const containsProfanity = PROFANITY_LIST.some(word => lowercaseText.includes(word));
  if (containsProfanity) {
    return { isSafe: false, isPositive: false, score: 0 };
  }

  // 2. If API Key is present, try Hugging Face Sentiment Analysis
  if (HUGGINGFACE_API_KEY) {
    try {
      const hf = new HfInference(HUGGINGFACE_API_KEY);
      const result = await hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: text
      });

      // distilbert output is usually sorted by score desc, or has labels POSITIVE/NEGATIVE
      const positiveLabel = result.find((r: any) => r.label === 'POSITIVE');
      const negativeLabel = result.find((r: any) => r.label === 'NEGATIVE');
      
      const positiveScore = positiveLabel?.score || 0;
      const negativeScore = negativeLabel?.score || 0;

      return {
        isSafe: true,
        isPositive: positiveScore > negativeScore,
        score: Math.max(positiveScore, negativeScore)
      };
    } catch (err) {
      console.warn('HuggingFace classification failed, using regex fallback:', err);
    }
  }

  // Local fallback: simple sentiment keyword rules
  const positiveKeywords = ['good', 'great', 'awesome', 'nice', 'excellent', 'happy', 'yes', 'perfect', 'love', 'helpful'];
  const negativeKeywords = ['bad', 'slow', 'waste', 'hate', 'worse', 'expensive', 'empty', 'poor', 'sad', 'broken'];

  let posCount = 0;
  let negCount = 0;

  positiveKeywords.forEach(kw => { if (lowercaseText.includes(kw)) posCount++; });
  negativeKeywords.forEach(kw => { if (lowercaseText.includes(kw)) negCount++; });

  return {
    isSafe: true,
    isPositive: posCount >= negCount,
    score: 0.8
  };
}
