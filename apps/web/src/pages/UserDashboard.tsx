import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MapPin, Calendar, Clock, Star, ArrowRight, Briefcase, CheckCircle, TrendingUp } from "lucide-react";
import { matchingApi, type OpportunityResponse } from "../lib/api";
import { applicationsApi, type ApplicationResponse } from "../lib/api";
import { reviewsApi, type ReviewResponse } from "../lib/api";

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [recommended, setRecommended] = useState<OpportunityResponse[]>([]);
  const [activeApps, setActiveApps] = useState<ApplicationResponse[]>([]);
  const [completedTasks, setCompletedTasks] = useState<ApplicationResponse[]>([]);
  const [myReviews, setMyReviews] = useState<ReviewResponse[]>([]);
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
      const [matchesRes, appsRes] = await Promise.all([
        matchingApi.getMatches(),
        applicationsApi.listMy("provider"),
      ]);
      setRecommended(matchesRes.data.slice(0, 4));

      const apps = appsRes.data;
      setActiveApps(apps.filter((a) => a.status === "pending" || a.status === "accepted"));
      setCompletedTasks(apps.filter((a) => a.status === "accepted"));
    } catch (err) {
      setError("Failed to load dashboard");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMyReviews() {
    if (!user) return;
    try {
      const res = await reviewsApi.listForUser(user.id);
      setMyReviews(res.data);
    } catch {}
  }

  const reputationScore = completedTasks.length * 10 + myReviews.length * 5;

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
          <p className="font-serif text-2xl text-gray-400">Please sign in to view your dashboard</p>
          <Link to="/auth/callback" className="mt-4 inline-block text-sm text-sky-500 underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-charcoal sm:text-5xl">
              Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-2 text-sm text-gray-500">Here's your overview</p>
          </div>
          <Link
            to="/dashboard/creator"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-gray-600 transition hover:border-gray-300 hover:text-charcoal"
          >
            Creator view
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-[#FAFAFA] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50">
                <Briefcase size={18} strokeWidth={1.5} className="text-sky-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal">{activeApps.length}</p>
                <p className="text-xs text-gray-500">Active applications</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-[#FAFAFA] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle size={18} strokeWidth={1.5} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal">{completedTasks.length}</p>
                <p className="text-xs text-gray-500">Completed tasks</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-[#FAFAFA] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                <TrendingUp size={18} strokeWidth={1.5} className="text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal">{reputationScore}</p>
                <p className="text-xs text-gray-500">Reputation score</p>
              </div>
            </div>
          </div>
        </div>

        {recommended.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-2xl tracking-tight text-charcoal">Recommended for you</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {recommended.map((opp) => (
                <Link
                  key={opp.id}
                  to={`/opportunities/${opp.id}`}
                  className="group rounded-xl border border-border bg-white px-5 py-4 transition hover:shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full border border-sky-500/30 px-2 py-0.5 text-[10px] font-medium tracking-[0.15em] text-sky-500 uppercase">
                      {opp.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg leading-snug tracking-tight text-charcoal group-hover:text-sky-500 transition-colors">
                    {opp.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500">{opp.organization}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} strokeWidth={1.5} />
                      {opp.location || "Remote"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} strokeWidth={1.5} />
                      {opp.deadline
                        ? new Date(opp.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                        : "No deadline"}
                    </span>
                    {opp.estimated_hours && (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} strokeWidth={1.5} />
                        {opp.estimated_hours}h
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <Link
              to="/opportunities"
              className="mt-4 inline-flex items-center gap-1 text-sm text-sky-500 transition hover:text-sky-600"
            >
              Browse all opportunities
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </section>
        )}

        {activeApps.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-2xl tracking-tight text-charcoal">Active applications</h2>
            <div className="mt-6 space-y-3">
              {activeApps.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-border bg-white px-5 py-4 transition hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg tracking-tight text-charcoal">
                        Application #{app.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-500">Status: {app.status}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-gray-100 px-3 py-0.5 text-[11px] font-medium text-gray-500">
                      Applied{" "}
                      {new Date(app.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {completedTasks.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-2xl tracking-tight text-charcoal">Completed work</h2>
            <div className="mt-6 space-y-3">
              {completedTasks.map((app) => (
                <Link
                  key={app.id}
                  to={`/tasks/${app.opportunity_id}/review`}
                  className="group flex items-center justify-between rounded-xl border border-border px-5 py-4 transition hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg tracking-tight text-charcoal group-hover:text-sky-500 transition-colors">
                      Opportunity #{app.opportunity_id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">Status: {app.status}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-0.5 text-[11px] font-medium text-emerald-600">
                    Completed
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {myReviews.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-2xl tracking-tight text-charcoal">Your reviews</h2>
            <div className="mt-6 space-y-3">
              {myReviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-border bg-[#FAFAFA] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-charcoal">Review for {review.receiver_id}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          strokeWidth={1.5}
                          className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{review.comments}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {recommended.length === 0 && activeApps.length === 0 && completedTasks.length === 0 && (
          <div className="mt-20 text-center">
            <p className="font-serif text-2xl text-gray-400">Get started</p>
            <p className="mt-2 text-sm text-gray-400">
              Browse{" "}
              <Link to="/opportunities" className="text-sky-500 underline">
                opportunities
              </Link>{" "}
              or{" "}
              <Link to="/profile/create" className="text-sky-500 underline">
                complete your profile
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}