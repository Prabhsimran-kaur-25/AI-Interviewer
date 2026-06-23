export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 bg-white">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-3xl font-semibold text-gray-900">AI Interviewer</h1>
        <p className="mt-3 text-gray-600">
          Practice technical interviews with an AI that asks follow-up
          questions and scores your answers.
        </p>

        <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 px-6 py-8">
          <p className="text-sm text-gray-500">
            Subject selection and the interview flow go here next.
          </p>
        </div>
      </div>
    </main>
  );
}
