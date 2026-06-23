import { GoogleGenerativeAI } from "@google/generative-ai";

// Single shared client. Never import GoogleGenerativeAI directly anywhere else —
// route through this file so the API key and model name live in one place.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // We throw lazily (inside getModel) rather than at import time, so that
  // build steps that don't need the key (e.g. static page generation) don't fail.
  console.warn("GEMINI_API_KEY is not set. AI features will fail until it's added to .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey ?? "");

// gemini-1.5-flash: fast + free-tier friendly, good enough for question generation
// and scoring. Swap to a stronger model later if answer quality needs improving.
export function getModel() {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to .env.local (see README).");
  }
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}
