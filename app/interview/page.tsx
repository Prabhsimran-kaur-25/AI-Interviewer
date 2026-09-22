"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ConversationTurn,
  Difficulty,
  InterviewTurnResponse,
  Subject,
  ReportResponse
} from "@/lib/types";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = searchParams.get("subject") as Subject | null;
  const difficulty = searchParams.get("difficulty") as Difficulty | null;
  const durationMinutes = Number(searchParams.get("duration") ?? 10);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [startTime] = useState(() => Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!subject || !difficulty) {
      router.replace("/");
    }
  }, [subject, difficulty, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, report]);

  useEffect(() => {
    if (isOver && messages.length > 0) {
      generateReport();
    }
  }, [isOver]);

  async function generateReport() {
    setIsGeneratingReport(true);
    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.text,
      }));
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, difficulty, conversationHistory }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        console.error("Failed to fetch report");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  }

  async function sendTurn(history: ChatMessage[]) {
    setIsLoading(true);
    setError(null);
    try {
      const conversationHistory: ConversationTurn[] = history.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          difficulty,
          durationMinutes,
          startTime,
          conversationHistory,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const data: InterviewTurnResponse = await res.json();
      setMessages((prev) => [...prev, { role: "model", text: data.message }]);

      if (data.action === "end_interview") {
        setIsOver(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong talking to the interviewer."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (subject && difficulty && !hasStarted.current) {
      hasStarted.current = true;
      sendTurn([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, difficulty]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading || isOver) return;

    const next = [...messages, { role: "user" as const, text: input.trim() }];
    setMessages(next);
    setInput("");
    sendTurn(next);
  }

  if (!subject || !difficulty) {
    return null;
  }

  return (
    <main className="flex-1 flex flex-col bg-white max-w-2xl w-full mx-auto px-6 py-8">
      <header className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-lg font-semibold text-gray-900">
          {subject} Interview
        </h1>
        <p className="text-sm text-gray-500 capitalize">
          {difficulty} level &middot; {durationMinutes} min
        </p>
      </header>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "model"
                ? "self-start max-w-[85%] rounded-lg bg-gray-100 px-4 py-3 text-gray-900"
                : "self-end max-w-[85%] rounded-lg bg-gray-900 px-4 py-3 text-white"
            }
          >
            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}

        {isLoading && (
          <div className="self-start max-w-[85%] rounded-lg bg-gray-100 px-4 py-3">
            <p className="text-sm text-gray-400">Thinking…</p>
          </div>
        )}

        {error && (
          <div className="self-start max-w-[85%] rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isOver && (
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview Complete</h2>
            {isGeneratingReport ? (
              <p className="text-sm text-gray-500 animate-pulse">Generating your performance report...</p>
            ) : report ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Overall</p>
                    <p className="text-2xl font-bold text-gray-900">{report.scores?.overall ?? 0}/100</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Communication</p>
                    <p className="text-2xl font-bold text-gray-900">{report.scores?.communication ?? 0}/10</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Tech Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">{report.scores?.technical_accuracy ?? 0}/10</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Problem Solving</p>
                    <p className="text-2xl font-bold text-gray-900">{report.scores?.problem_solving ?? 0}/10</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-green-700 uppercase mb-2">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {report.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-red-700 uppercase mb-2">Weaknesses</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {report.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-blue-700 uppercase mb-2">Suggestions</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {report.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => router.push("/")}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
                  >
                    Back to home
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-600">Failed to load report.</p>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {!isOver && (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your answer..."
              disabled={isLoading}
              rows={2}
              className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:bg-gray-300 transition"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={null}>
      <InterviewContent />
    </Suspense>
  );
}
