import { NextRequest, NextResponse } from "next/server";
import { ai, MODEL_NAME } from "@/lib/gemini";
import { buildSystemPrompt, getTimeRemainingMinutes } from "@/lib/prompts";
import { InterviewRequest, InterviewTurnResponse } from "@/lib/types";

function isValidTurnResponse(data: unknown): data is InterviewTurnResponse {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  const validActions = ["follow_up", "next_question", "wrap_up", "end_interview"];
  return (
    typeof d.message === "string" &&
    d.message.length > 0 &&
    typeof d.action === "string" &&
    validActions.includes(d.action)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: InterviewRequest = await req.json();
    const { subject, difficulty, durationMinutes, startTime, conversationHistory } = body;

    if (!subject || !difficulty || !durationMinutes || !startTime) {
      return NextResponse.json(
        { error: "Missing required fields: subject, difficulty, durationMinutes, startTime" },
        { status: 400 }
      );
    }

    const timeRemaining = getTimeRemainingMinutes(startTime, durationMinutes);
    const systemPrompt = buildSystemPrompt(subject, difficulty, timeRemaining);

    const contents = conversationHistory.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.content }],
    }));

    const promptForThisTurn =
      conversationHistory.length === 0
        ? "Begin the interview with your first question."
        : "Continue the interview based on the conversation so far.";

    contents.push({ role: "user", parts: [{ text: promptForThisTurn }] });

    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const rawText = result.text ?? "";

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const stripped = rawText.replace(/```json\n?|```/g, "").trim();
      try {
        parsed = JSON.parse(stripped);
      } catch {
        return NextResponse.json(
          { error: "AI returned invalid JSON", raw: rawText },
          { status: 502 }
        );
      }
    }

    if (!isValidTurnResponse(parsed)) {
      return NextResponse.json(
        { error: "AI response did not match expected shape", raw: parsed },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ...parsed,
      timeRemainingMinutes: timeRemaining,
    });
  } catch (err) {
    console.error("Interview API error:", err);
    return NextResponse.json(
      { error: "Something went wrong processing the interview turn." },
      { status: 500 }
    );
  }
}
