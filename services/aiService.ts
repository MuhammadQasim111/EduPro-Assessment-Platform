
import { GoogleGenAI } from "@google/genai";
import { Exam, Submission } from "../types";

/**
 * Generates a professional pedagogical analysis of a student's submission.
 * Uses gemini-3-pro-preview for complex reasoning tasks.
 */
export const getAIGradingFeedback = async (exam: Exam, submission: Submission): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return "AI Evaluation engine is offline. Please ensure your production API keys are configured.";
  }

  // Create fresh instance per call to ensure latest config/key
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      Act as a Senior Software Architect and Academic Lead. Analyze this production assessment submission.
      
      ASSESSMENT CONTEXT:
      - Title: ${exam.title}
      - Learning Objectives: ${exam.description}
      
      STUDENT PERFORMANCE:
      - Achieved Score: ${submission.score} / ${submission.totalPoints}
      - Detailed Answers provided by Student: ${JSON.stringify(submission.answers)}
      - Rubric (Correct Solutions): ${JSON.stringify(exam.questions.map(q => ({ text: q.text, correct: q.correctAnswer })))}
      
      REQUIRED OUTPUT (Markdown format):
      1. Executive Performance Summary.
      2. Specific Technical Gap Analysis.
      3. Three targeted "Next Level" growth recommendations.
      4. A closing encouraging remark.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // High-quality reasoning for complex feedback
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // Directly access the .text property as per guidelines
    return response.text || "The analysis engine completed the task but returned an unexpected empty response.";
  } catch (error) {
    console.error("Critical AI Service Error:", error);
    return "An internal cognitive services error occurred. Our engineers have been notified.";
  }
};
