import { NextRequest, NextResponse } from "next/server";
import { ai, MODEL_NAME } from "@/lib/gemini";
import { InterviewRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: InterviewRequest = await req.json();
    const { subject, difficulty, conversationHistory } = body;

    if (!subject || !difficulty || !conversationHistory) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a strict but fair technical hiring manager. 
The user has just completed a mock interview for the subject: ${subject} at ${difficulty} difficulty.
Analyze the provided conversation history and output a JSON report evaluating their performance.
You must strictly return JSON matching this schema:
{
  "scores": {
    "overall": number (0-100),
    "communication": number (0-10),
    "technical_accuracy": number (0-10),
    "problem_solving": number (0-10)
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"]
}`;

    const contents = conversationHistory.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.content }],
    }));

    contents.push({ role: "user", parts: [{ text: "Please generate the evaluation report based on this interview." }] });

    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const rawText = result.text ?? "";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const stripped = rawText.replace(/```json\n?|```/g, "").trim();
      parsed = JSON.parse(stripped);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Report API error:", err);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
