import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Building2,
  Star,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { opportunitiesApi, type OpportunityResponse } from "../lib/api";
import { applicationsApi, type ApplicationCreate } from "../lib/api";
import { reviewsApi, type ReviewResponse } from "../lib/api";

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [opportunity, setOpportunity] = useState<OpportunityResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    loadOpportunity();
    if (isAuthenticated) {
      checkApplicationStatus();
      loadReviews();
    }
  }, [id, authLoading, isAuthenticated]);

  async function loadOpportunity() {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await opportunitiesApi.get(id);
      setOpportunity(res.data);
    } catch {
      setError("Failed to load opportunity");
    } finally {
      setIsLoading(false);
    }
  }

  async function checkApplicationStatus() {
    if (!id) return;
    try {
      const res = await applicationsApi.listMy("provider");
      const app = res.data.find((a) => a.opportunity_id === id);
      if (app) setApplicationStatus(app.status);
    } catch {}
  }

  async function loadReviews() {
    if (!id || !opportunity) return;
    try {
      const res = await reviewsApi.listForUser(opportunity.creator_id);
      setReviews(res.data);
    } catch {}
  }

  async function handleApply() {
    if (!id || !isAuthenticated) return;
    try {
      await applicationsApi.apply(id, { message: "" });
      setApplicationStatus("pending");
      navigate("/opportunities");
    } catch {
      alert("Failed to apply. Please try again.");
    }
  }

  async function handleDelete() {
    if (!id || !opportunity) return;
    if (!window.confirm(`Delete "${opportunity.title}"? This cannot be undone.`)) return;
    try {
      await opportunitiesApi.delete(id);
      navigate("/opportunities");
    } catch {
      alert("Failed to delete opportunity.");
    }
  }

  async function handleMarkComplete() {
    if (!id) return;
    try {
      const res = await opportunitiesApi.update(id, { status: "completed" });
      setOpportunity(res.data);
    } catch {
      alert("Failed to update status.");
    }
  }

  const isCreator = user && opportunity && user.id === opportunity.creator_id;

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

  if (error || !opportunity) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="font-serif text-2xl text-gray-400">
            Opportunity not found
          </p>
          <Link
            to="/opportunities"
            className="mt-4 inline-block text-sm text-sky-500 underline"
          >
            Back to opportunities
          </Link>
        </div>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1000px]">
        <Link
          to="/opportunities"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-charcoal"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to opportunities
        </Link>

        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="rounded-full border border-sky-500/30 px-3 py-0.5 text-[10px] font-medium tracking-[0.15em] text-sky-500 uppercase">
            {opportunity.category}
          </span>
          <div className="flex items-start gap-4">
            <span
              className={`shrink-0 rounded-full px-3 py-0.5 text-[10px] font-medium tracking-[0.1em] uppercase ${
                opportunity.is_paid
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {opportunity.is_paid ? "Paid" : "Volunteer"}
            </span>
            {opportunity.is_paid && opportunity.payment_amount && (
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-0.5 text-[10px] font-medium text-emerald-600">
                PKR {opportunity.payment_amount.toLocaleString()}
              </span>
            )}
            <span
              className={`shrink-0 rounded-full px-3 py-0.5 text-[10px] font-medium tracking-[0.1em] uppercase ${
                opportunity.urgency === "high" ||
                opportunity.urgency === "critical"
                  ? "bg-red-50 text-red-600"
                  : opportunity.urgency === "medium"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-gray-50 text-gray-500"
              }`}
            >
              {opportunity.urgency}
            </span>
          </div>
        </div>

        <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-charcoal sm:text-5xl">
          {opportunity.title}
        </h1>

        <div className="mt-8">
          <h2 className="mb-2 text-xs font-medium tracking-[0.1em] text-gray-400 uppercase">
            Description
          </h2>
          <p className="text-sm leading-[1.8] text-gray-600">
            {opportunity.description}
          </p>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-xs font-medium tracking-[0.1em] text-gray-400 uppercase">
            Skills required
          </h2>
          <div className="flex flex-wrap gap-2">
            {opportunity.required_skills?.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-brand-bg px-3 py-1 text-xs font-medium text-sky-500"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-[#FAFAFA]">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="text-xs tracking-[0.1em] text-gray-400 uppercase">
              Location
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-charcoal">
              <MapPin size={14} strokeWidth={1.5} className="text-gray-400" />
              {opportunity.location || "Not specified"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="text-xs tracking-[0.1em] text-gray-400 uppercase">
              Deadline
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-charcoal">
              <Calendar size={14} strokeWidth={1.5} className="text-gray-400" />
              {opportunity.deadline
                ? new Date(opportunity.deadline).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Not specified"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="text-xs tracking-[0.1em] text-gray-400 uppercase">
              Est. hours
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-charcoal">
              <Clock size={14} strokeWidth={1.5} className="text-gray-400" />
              {opportunity.estimated_hours
                ? `${opportunity.estimated_hours}h`
                : "Not specified"}
            </span>
          </div>
          {opportunity.is_paid && opportunity.payment_amount && (
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <span className="text-xs tracking-[0.1em] text-gray-400 uppercase">
                Payment
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                PKR {opportunity.payment_amount.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="text-xs tracking-[0.1em] text-gray-400 uppercase">
              Posted by
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-charcoal">
              <Building2
                size={14}
                strokeWidth={1.5}
                className="text-gray-400"
              />
              {opportunity.organization}
            </span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-xs tracking-[0.1em] text-gray-400 uppercase">
              Status
            </span>
            <span className="rounded-full px-3 py-0.5 text-xs font-medium text-gray-600">
              {opportunity.status}
            </span>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3">
          {isCreator ? (
            <>
              <Link
                to={`/opportunities/new?edit=${id}`}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90"
              >
                <Pencil size={16} strokeWidth={1.5} />
                Edit
              </Link>
              {opportunity.status === "in_progress" && (
                <button
                  onClick={handleMarkComplete}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  Mark as completed
                </button>
              )}
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={16} strokeWidth={1.5} />
                Delete
              </button>
            </>
          ) : applicationStatus === "accepted" ? (
            <Link
              to={`/tasks/${id}/review`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90"
            >
              Submit completed work
            </Link>
          ) : applicationStatus === "pending" ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2 text-sm font-medium text-gray-500">
              Application sent — awaiting approval
            </span>
          ) : applicationStatus === "rejected" ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-2 text-sm font-medium text-red-500">
              Application rejected
            </span>
          ) : (
            <button
              onClick={handleApply}
              disabled={!isAuthenticated}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-50"
            >
              Apply now
            </button>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl tracking-tight text-charcoal">
              Reviews
              {averageRating > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 text-sm font-normal text-gray-500">
                  <Star
                    size={14}
                    strokeWidth={1.5}
                    className="fill-amber-400 text-amber-400"
                  />
                  {averageRating.toFixed(1)} ({reviews.length})
                </span>
              )}
            </h2>
            <div className="mt-6 space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-border bg-[#FAFAFA] px-5 py-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-charcoal">
                      {review.reviewer_id}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          strokeWidth={1.5}
                          className={
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {review.comments}
                  </p>
                  <p className="mt-2 text-[11px] text-gray-400">
                    {new Date(review.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
