import { useEffect, useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/health")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white p-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          BuildByte Hackathon
        </h1>
        <div className="rounded-xl border border-gray-200 px-6 py-4 text-gray-700">
          {message || "Loading..."}
        </div>
      </div>
    </div>
  );
}
