import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  generationConfig: {
    temperature: 0.3,
    topP: 0.85,
    maxOutputTokens: 65536,
    responseMimeType: "application/json",
  },
});
