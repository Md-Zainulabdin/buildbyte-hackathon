import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { opportunitiesApi, usersApi, type OpportunityResponse } from "../lib/api";
import { applicationsApi, type ApplicationResponse } from "../lib/api";

interface AppWithOpp {
  application: ApplicationResponse;
  opportunity: OpportunityResponse;
}

export default function CreatorDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [postedOpps, setPostedOpps] = useState<OpportunityResponse[]>([]);
  const [applicationsByOpp, setApplicationsByOpp] = useState<
    Record<string, AppWithOpp[]>
  >({});
  const [selectedContributors, setSelectedContributors] = useState<
    Record<string, string>
  >({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) loadDashboard();
  }, [authLoading, isAuthenticated]);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);
    try {
      const [oppsRes, appsRes] = await Promise.all([
        opportunitiesApi.list({}),
        applicationsApi.listMy("creator"),
      ]);
      const userOpps = oppsRes.data.filter((o) => o.creator_id === user?.id);
      setPostedOpps(userOpps);

      const apps = appsRes.data;
      const grouped: Record<string, AppWithOpp[]> = {};
      const userIds = new Set<string>();
      for (const app of apps) {
        userIds.add(app.user_id);
        try {
          const oppRes = await opportunitiesApi.get(app.opportunity_id);
          const opp = oppRes.data;
          if (opp) {
            const key = app.opportunity_id;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({ application: app, opportunity: opp });
          }
        } catch {}
      }
      setApplicationsByOpp(grouped);

      const names: Record<string, string> = {};
      await Promise.all(
        Array.from(userIds).map(async (uid) => {
          try {
            const uRes = await usersApi.get(uid);
            names[uid] = uRes.data.name;
          } catch {
            names[uid] = uid.slice(0, 8);
          }
        })
      );
      setUserNames(names);
    } catch (err) {
      setError("Failed to load dashboard");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await opportunitiesApi.delete(id);
      setPostedOpps((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Failed to delete opportunity.");
    }
  }

  async function handleSelectContributor(
    opportunityId: string,
    applicationId: string,
    userId: string,
  ) {
    try {
      await applicationsApi.updateStatus(applicationId, "accepted");
      await opportunitiesApi.update(opportunityId, { status: "in_progress" });
      setSelectedContributors((prev) => ({ ...prev, [opportunityId]: userId }));
      setPostedOpps((prev) =>
        prev.map((o) =>
          o.id === opportunityId ? { ...o, status: "in_progress" } : o
        )
      );
      // Refresh
      const res = await applicationsApi.listMy("creator");
      const grouped: Record<string, AppWithOpp[]> = {};
      for (const app of res.data) {
        try {
          const oppRes = await opportunitiesApi.get(app.opportunity_id);
          const opp = oppRes.data;
          if (opp) {
            const key = app.opportunity_id;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({ application: app, opportunity: opp });
          }
        } catch {}
      }
      setApplicationsByOpp(grouped);
    } catch {
      alert("Failed to select contributor");
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-6 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <p className="font-serif text-2xl text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-[1000px] text-center">
          <p className="font-serif text-2xl text-gray-400">
            Please sign in to view your creator dashboard
          </p>
          <Link
            to="/auth/callback"
            className="mt-4 inline-block text-sm text-sky-500 underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1000px]">
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-charcoal"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-charcoal sm:text-5xl">
              Creator Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {postedOpps.length} posted{" "}
              {postedOpps.length === 1 ? "opportunity" : "opportunities"}
            </p>
          </div>
          <Link
            to="/opportunities/new"
            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90"
          >
            Post new
          </Link>
        </div>

        {postedOpps.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="font-serif text-2xl text-gray-400">
              No opportunities posted yet
            </p>
            <p className="mt-2 text-sm text-gray-400">
              <Link to="/opportunities/new" className="text-sky-500 underline">
                Post your first opportunity
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {postedOpps.map((opp) => {
              const applicants = applicationsByOpp[opp.id] || [];
              const selected = selectedContributors[opp.id];

              return (
                <div
                  key={opp.id}
                  className="rounded-xl border border-border bg-white px-6 py-5 sm:px-7 sm:py-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="rounded-full border border-sky-500/30 px-2 py-0.5 text-[10px] font-medium tracking-[0.15em] text-sky-500 uppercase">
                            {opp.category}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                              opp.urgency === "high" ||
                              opp.urgency === "critical"
                                ? "bg-red-50 text-red-600"
                                : opp.urgency === "medium"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-gray-50 text-gray-500"
                            }`}
                          >
                            {opp.urgency}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                              opp.is_paid
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {opp.is_paid ? "Paid" : "Volunteer"}
                          </span>
                          {opp.is_paid && opp.payment_amount && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                              PKR {opp.payment_amount.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/opportunities/new?edit=${opp.id}`}
                            className="rounded-full border border-border px-3 py-0.5 text-[10px] font-medium text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
                          >
                            <Pencil
                              size={12}
                              strokeWidth={1.5}
                              className="inline"
                            />{" "}
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(opp.id, opp.title)}
                            className="rounded-full border border-border px-3 py-0.5 text-[10px] font-medium text-red-400 transition hover:border-red-200 hover:text-red-600"
                          >
                            <Trash2
                              size={12}
                              strokeWidth={1.5}
                              className="inline"
                            />{" "}
                            Delete
                          </button>
                        </div>
                      </div>
                      <h3 className="font-serif text-xl leading-snug tracking-tight text-charcoal">
                        {opp.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} strokeWidth={1.5} />
                          {opp.location || "Remote"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={14} strokeWidth={1.5} />
                          {opp.deadline
                            ? new Date(opp.deadline).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                },
                              )
                            : "No deadline"}
                        </span>
                        {opp.estimated_hours && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={14} strokeWidth={1.5} />
                            {opp.estimated_hours}h
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} strokeWidth={1.5} />
                          {applicants.length} applicant
                          {applicants.length !== 1 ? "s" : ""}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle
                            size={14}
                            strokeWidth={1.5}
                            className="text-emerald-500"
                          />
                          {
                            applicants.filter(
                              (a) => a.application.status === "accepted",
                            ).length
                          }{" "}
                          accepted
                        </span>
                      </div>

                      {applicants.length > 0 && (
                        <div className="mt-4 border-t border-border pt-4">
                          <p className="mb-3 text-xs font-medium tracking-[0.1em] text-gray-400 uppercase">
                            Applicants
                          </p>
                          <div className="space-y-2">
                            {applicants.map((app) => (
                              <div
                                key={app.application.id}
                                className="flex items-center justify-between rounded-lg bg-[#FAFAFA] px-4 py-3"
                              >
                                <div>
                                  <p className="text-sm font-medium text-charcoal">
                                    {userNames[app.application.user_id] || app.application.user_id.slice(0, 8)}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Applied{" "}
                                    {new Date(
                                      app.application.created_at,
                                    ).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {app.application.status === "accepted" ? (
                                    <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-[11px] font-medium text-emerald-600">
                                      Selected
                                    </span>
                                  ) : !selected ? (
                                    <button
                                      onClick={() =>
                                        handleSelectContributor(
                                          opp.id,
                                          app.application.id,
                                          app.application.user_id,
                                        )
                                      }
                                      className="rounded-full border border-border px-3 py-1 text-xs text-gray-600 transition hover:border-gray-300 hover:text-charcoal"
                                    >
                                      Select
                                    </button>
                                  ) : (
                                    <span className="rounded-full bg-gray-50 px-3 py-0.5 text-[11px] font-medium text-gray-400">
                                      Another selected
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {applicants.length === 0 && (
                        <p className="mt-3 text-xs text-gray-400">
                          No applicants yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
