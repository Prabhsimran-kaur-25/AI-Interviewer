export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type Subject =
  | "DSA"
  | "OOP"
  | "DBMS"
  | "Operating Systems"
  | "Computer Networks";

export interface ConversationTurn {
  role: "user" | "model";
  content: string;
}

export interface InterviewRequest {
  subject: Subject;
  difficulty: Difficulty;
  durationMinutes: number;
  startTime: number;
  conversationHistory: ConversationTurn[];
}

export type InterviewAction =
  | "follow_up"
  | "next_question"
  | "wrap_up"
  | "end_interview";

export interface InterviewTurnResponse {
  message: string;
  action: InterviewAction;
  internalNote?: string;
}

export interface ReportResponse {
  scores: {
    overall: number;
    communication: number;
    technical_accuracy: number;
    problem_solving: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}
