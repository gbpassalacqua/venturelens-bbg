import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/** Centralized model name — change here to update everywhere */
export const GEMINI_MODEL = "gemini-3-flash-preview";

/** Full analysis model (large output, structured JSON) */
export const geminiModel = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
  generationConfig: {
    temperature: 0.3,
    topP: 0.85,
    maxOutputTokens: 65536,
    responseMimeType: "application/json",
  },
});

/** Lightweight extraction model (small output, fast, low temp) */
export const geminiExtractModel = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
  generationConfig: {
    temperature: 0.1,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  },
});
