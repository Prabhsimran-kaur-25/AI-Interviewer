import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will fail until it's added to .env.local");
}

export const ai = new GoogleGenAI({ apiKey: apiKey ?? "" });

export const MODEL_NAME = "gemini-2.5-flash";
