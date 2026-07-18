import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Clock } from "lucide-react";
import { getOpportunities, safeJSON } from "../lib/helpers";
import type { Opportunity } from "../types/opportunity";

interface Application {
  opportunityId: string;
  appliedAt: string;
}

export default function Applications() {
  const applications = useMemo(() => {
    const stored = localStorage.getItem("applications");
    return safeJSON<Application[]>(stored || "[]", []);
  }, []);

  const opportunities = useMemo(() => getOpportunities(), []);

  const completedIds = useMemo(() => {
    const stored = localStorage.getItem("completedTasks");
    const all = safeJSON<{ opportunityId: string }[]>(stored || "[]", []);
    return new Set(all.map((s) => s.opportunityId));
  }, []);

  const appliedOpps = useMemo(() => {
    return applications
      .map((app: Application) => {
        const opp = opportunities.find(
          (o: Opportunity) => o.id === app.opportunityId
        );
        return opp
          ? { ...opp, appliedAt: app.appliedAt, completed: completedIds.has(opp.id) }
          : null;
      })
      .filter((x): x is Opportunity & { appliedAt: string; completed: boolean } => x !== null);
  }, [applications, opportunities, completedIds]);

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1000px]">
        <div>
          <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-charcoal sm:text-5xl">
            Applications
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {appliedOpps.length} application{appliedOpps.length !== 1 ? "s" : ""}
          </p>
        </div>

        {appliedOpps.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="font-serif text-2xl text-gray-400">
              No applications yet
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Browse{" "}
              <Link to="/opportunities" className="text-sky-500 underline">
                opportunities
              </Link>{" "}
              to get started.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {appliedOpps.map((opp: Opportunity & { appliedAt: string; completed: boolean }) => (
              <Link
                key={opp.id}
                to={opp.completed ? `/tasks/${opp.id}/review` : `/opportunities/${opp.id}`}
                className="group block rounded-xl border border-border bg-white px-6 py-5 transition hover:shadow-sm sm:px-7 sm:py-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full border border-sky-500/30 px-2 py-0.5 text-[10px] font-medium tracking-[0.15em] text-sky-500 uppercase">
                        {opp.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.1em] uppercase ${
                          opp.paid === "Paid"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {opp.paid}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl leading-snug tracking-tight text-charcoal group-hover:text-sky-500 transition-colors">
                      {opp.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {opp.organization}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} strokeWidth={1.5} />
                        {opp.area}, {opp.city}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} strokeWidth={1.5} />
                        {new Date(opp.deadline).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {opp.estimatedHours && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} strokeWidth={1.5} />
                          {opp.estimatedHours}h
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-0.5 text-[11px] font-medium ${
                        opp.completed
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {opp.completed ? "Completed" : "Applied"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(opp.appliedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
