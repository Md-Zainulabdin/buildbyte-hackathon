import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getOpportunities, safeJSON } from "../lib/helpers";
import type { Opportunity } from "../types/opportunity";

interface CompletedSubmission {
  opportunityId: string;
  description: string;
  hoursWorked: string;
  notes: string;
  submittedAt: string;
}

export default function CompletedTask() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [notes, setNotes] = useState("");

  const opportunity = useMemo(() => {
    return getOpportunities().find((o: Opportunity) => o.id === id);
  }, [id]);

  const hasApplied = useMemo(() => {
    const apps = safeJSON<{ opportunityId: string }[]>(localStorage.getItem("applications") || "[]", []);
    return apps.some((a) => a.opportunityId === id);
  }, [id]);

  const existingSubmission = useMemo(() => {
    const all = safeJSON<CompletedSubmission[]>(localStorage.getItem("completedTasks") || "[]", []);
    return all.find((s) => s.opportunityId === id);
  }, [id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !description.trim() || !hoursWorked) return;

    const submission: CompletedSubmission = {
      opportunityId: id,
      description: description.trim(),
      hoursWorked,
      notes: notes.trim(),
      submittedAt: new Date().toISOString(),
    };

    const all = safeJSON<CompletedSubmission[]>(localStorage.getItem("completedTasks") || "[]", []);
    all.push(submission);
    localStorage.setItem("completedTasks", JSON.stringify(all));

    navigate("/applications");
  }

  if (!opportunity) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="font-serif text-2xl text-gray-400">Opportunity not found</p>
          <Link to="/opportunities" className="mt-4 inline-block text-sm text-sky-500 underline">
            Browse opportunities
          </Link>
        </div>
      </div>
    );
  }

  if (!hasApplied) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="font-serif text-2xl text-gray-400">Not applied</p>
          <p className="mt-2 text-sm text-gray-400">
            You must apply before submitting completed work.
          </p>
          <Link
            to={`/opportunities/${id}`}
            className="mt-4 inline-block text-sm text-sky-500 underline"
          >
            View opportunity
          </Link>
        </div>
      </div>
    );
  }

  if (existingSubmission) {
    return (
      <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-[560px]">
          <Link
            to="/applications"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-charcoal"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back to applications
          </Link>

          <h1 className="font-serif text-3xl leading-[1.15] tracking-tight text-charcoal sm:text-4xl">
            Submission sent
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            for {opportunity.title}
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <p className="text-xs tracking-[0.1em] text-gray-400 uppercase">
                Work description
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal">
                {existingSubmission.description}
              </p>
            </div>
            <div>
              <p className="text-xs tracking-[0.1em] text-gray-400 uppercase">
                Hours worked
              </p>
              <p className="mt-1.5 text-sm text-charcoal">
                {existingSubmission.hoursWorked}h
              </p>
            </div>
            {existingSubmission.notes && (
              <div>
                <p className="text-xs tracking-[0.1em] text-gray-400 uppercase">
                  Notes
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal">
                  {existingSubmission.notes}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-400">
              Submitted on{" "}
              {new Date(existingSubmission.submittedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[560px]">
        <Link
          to="/applications"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-charcoal"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to applications
        </Link>

        <h1 className="font-serif text-3xl leading-[1.15] tracking-tight text-charcoal sm:text-4xl">
          Submission sent
        </h1>
        <p className="mt-2 text-sm text-gray-500">{opportunity.title}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-xs font-medium tracking-[0.1em] text-gray-400 uppercase">
              What did you do?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the work you completed..."
              className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium tracking-[0.1em] text-gray-400 uppercase">
              Hours worked
            </label>
            <input
              type="number"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              placeholder="e.g. 10"
              min="1"
              className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium tracking-[0.1em] text-gray-400 uppercase">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional notes..."
              className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
