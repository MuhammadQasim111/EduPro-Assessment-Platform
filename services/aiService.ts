
import { GoogleGenAI } from "@google/genai";
import { Exam, Submission } from "../types";

export const getAIGradingFeedback = async (exam: Exam, submission: Submission): Promise<string> => {
  // Fix: Always create a new GoogleGenAI instance right before making an API call to ensure use of latest credentials
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const prompt = `
      As an expert educator, provide concise and constructive feedback for a student's exam submission.
      
      EXAM: ${exam.title}
      DESCRIPTION: ${exam.description}
      
      SUBMISSION DATA:
      - Score: ${submission.score} / ${submission.totalPoints}
      - Student Answers: ${JSON.stringify(submission.answers)}
      - Correct Answers: ${JSON.stringify(exam.questions.map(q => ({ id: q.id, correct: q.correctAnswer })))}
      
      INSTRUCTIONS:
      1. Identify strengths based on correct answers.
      2. Identify weak areas.
      3. Suggest 2-3 topics for further study.
      4. Keep it professional but encouraging.
    `;

    // Fix: Using generateContent with Gemini 3 Flash and optional thinking configuration for optimal performance
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        // Set thinkingBudget to 0 for lower latency as this is a straightforward summarization/feedback task
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // Fix: response.text is a property, not a method; extracting directly
    return response.text || "Unable to generate AI feedback at this time.";
  } catch (error) {
    console.error("AI Feedback Error:", error);
    // Generic error message for student privacy and security
    return "The AI analysis service is temporarily unavailable. Please try again later.";
  }
};
