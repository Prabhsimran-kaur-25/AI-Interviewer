"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Difficulty, Subject } from "@/lib/types";

const SUBJECTS: Subject[] = [
  "DSA",
  "OOP",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
];

const DIFFICULTIES: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

const DURATIONS = [5, 10, 15, 20];

export default function Home() {
  const router = useRouter();
  const [subject, setSubject] = useState<Subject>("DBMS");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [duration, setDuration] = useState(10);
  const [resumeName, setResumeName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResumeName(file.name);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text) {
        sessionStorage.setItem("resumeText", data.text);
      } else {
        alert("Failed to parse resume");
        setResumeName("");
      }
    } catch (err) {
      alert("Error uploading resume");
      setResumeName("");
    } finally {
      setIsUploading(false);
    }
  }

  function handleStart() {
    if (!resumeName) {
      sessionStorage.removeItem("resumeText");
    }

    const params = new URLSearchParams({
      subject,
      difficulty,
      duration: String(duration),
    });
    router.push(`/interview?${params.toString()}`);
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 bg-white">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">
            AI Interviewer
          </h1>
          <p className="mt-3 text-gray-600">
            Practice technical interviews with an AI that asks follow-up
            questions and scores your answers.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 px-6 py-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Subject
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={
                    s === subject
                      ? "rounded-md border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                      : "rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:border-gray-400"
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Difficulty
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={
                    d === difficulty
                      ? "rounded-md border border-gray-900 bg-gray-900 px-2 py-2 text-xs font-medium text-white capitalize"
                      : "rounded-md border border-gray-300 px-2 py-2 text-xs text-gray-700 hover:border-gray-400 capitalize"
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={
                    d === duration
                      ? "rounded-md border border-gray-900 bg-gray-900 px-2 py-2 text-xs font-medium text-white"
                      : "rounded-md border border-gray-300 px-2 py-2 text-xs text-gray-700 hover:border-gray-400"
                  }
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Resume Context (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <span>{isUploading ? "Uploading..." : "Upload PDF"}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              {resumeName && !isUploading && (
                <span className="text-sm text-green-600 truncate max-w-[200px]">
                  ✓ {resumeName}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Upload your resume to get personalized questions.</p>
          </div>

          <button
            onClick={handleStart}
            disabled={isUploading}
            className="w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:bg-gray-400 transition"
          >
            {isUploading ? "Please wait..." : "Start Interview"}
          </button>
        </div>
      </div>
    </main>
  );
}
