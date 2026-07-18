import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { opportunitiesApi, type OpportunityResponse } from "../lib/api";
import { applicationsApi, type ApplicationResponse } from "../lib/api";

interface AppWithOpp {
  application: ApplicationResponse;
  opportunity: OpportunityResponse;
}

export default function Applications() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [items, setItems] = useState<AppWithOpp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) loadApplications();
  }, [authLoading, isAuthenticated]);

  async function loadApplications() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await applicationsApi.listMy("provider");
      const apps = res.data;

      // Fetch opportunity details for each application
      const withOpps = await Promise.all(
        apps.map(async (app) => {
          try {
            const oppRes = await opportunitiesApi.get(app.opportunity_id);
            return { application: app, opportunity: oppRes.data };
          } catch {
            return { application: app, opportunity: null };
          }
        })
      );
      setItems(withOpps.filter((x) => x.opportunity !== null) as AppWithOpp[]);
    } catch (err) {
      setError("Failed to load applications");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, { label: string; className: string }> = {
      pending: { label: "Applied", className: "bg-gray-100 text-gray-500" },
      accepted: { label: "Accepted", className: "bg-sky-50 text-sky-600" },
      rejected: { label: "Rejected", className: "bg-red-50 text-red-600" },
      withdrawn: { label: "Withdrawn", className: "bg-amber-50 text-amber-600" },
    };
    return labels[status] || { label: status, className: "bg-gray-100 text-gray-500" };
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1000px]">
        <div>
          <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-charcoal sm:text-5xl">
            Applications
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isLoading ? "Loading..." : `${items.length} application${items.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {isLoading ? (
          <div className="mt-20 text-center">
            <div className="mx-auto mb-6 h-8 w-8 animate-pulse rounded-full border-2 border-gray-300 border-t-gray-600" />
            <p className="font-serif text-2xl text-gray-500">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="mt-20 text-center">
            <p className="font-serif text-2xl text-red-500">{error}</p>
            <button onClick={loadApplications} className="mt-4 text-sm text-sky-500 underline">
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="font-serif text-2xl text-gray-400">No applications yet</p>
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
            {items.map(({ application, opportunity }) => {
              const opp = opportunity;
              const statusInfo = getStatusLabel(application.status);
              const isCompleted = application.status === "accepted";
              const link = isCompleted ? `/tasks/${opp.id}/review` : `/opportunities/${opp.id}`;

              return (
                <Link
                  key={application.id}
                  to={link}
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
                            opp.is_paid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {opp.is_paid ? "Paid" : "Volunteer"}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl leading-snug tracking-tight text-charcoal group-hover:text-sky-500 transition-colors">
                        {opp.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{opp.organization}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} strokeWidth={1.5} />
                          {opp.location || "Remote"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={14} strokeWidth={1.5} />
                          {opp.deadline
                            ? new Date(opp.deadline).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })
                            : "No deadline"}
                        </span>
                        {opp.estimated_hours && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={14} strokeWidth={1.5} />
                            {opp.estimated_hours}h
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-0.5 text-[11px] font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(application.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}