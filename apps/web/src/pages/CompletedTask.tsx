import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Star, AlertCircle, Loader2 } from "lucide-react";
import { opportunitiesApi, type OpportunityResponse } from "../lib/api";
import { applicationsApi, type ApplicationResponse } from "../lib/api";
import { reviewsApi, type ReviewResponse, type ReviewCreate } from "../lib/api";

export default function CompletedTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [opportunity, setOpportunity] = useState<OpportunityResponse | null>(null);
  const [application, setApplication] = useState<ApplicationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [description, setDescription] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [notes, setNotes] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [oppRes, appsRes] = await Promise.all([
        opportunitiesApi.get(id!),
        applicationsApi.listMy("provider"),
      ]);
      setOpportunity(oppRes.data);
      const app = appsRes.data.find((a) => a.opportunity_id === id);
      setApplication(app || null);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWorkSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !description.trim() || !hoursWorked) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Mark application as accepted/completed by submitting work
      if (application) {
        await applicationsApi.updateStatus(application.id, "accepted");
      }
      // Store work details locally for display
      const submission = {
        opportunityId: id,
        description: description.trim(),
        hoursWorked,
        notes: notes.trim(),
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem(`submission_${id}`, JSON.stringify(submission));
      navigate("/applications");
    } catch (err) {
      setSubmitError("Failed to submit work. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !opportunity || reviewRating === 0 || !reviewComment.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const review: ReviewCreate = {
        receiver_id: opportunity.creator_id,
        application_id: application?.id,
        rating: reviewRating,
        comments: reviewComment.trim(),
      };
      await reviewsApi.create(review);
      setReviewSubmitted(true);
    } catch (err) {
      setSubmitError("Failed to submit review. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const existingSubmission = localStorage.getItem(`submission_${id}`)
    ? JSON.parse(localStorage.getItem(`submission_${id}`)!)
    : null;

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-6 h-8 w-8 animate-pulse rounded-full border-2 border-gray-300 border-t-gray-600" />
          <p className="font-serif text-2xl text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
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

  if (!application) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="font-serif text-2xl text-gray-400">Not applied</p>
          <p className="mt-2 text-sm text-gray-400">
            You must apply before submitting completed work.
          </p>
          <Link to={`/opportunities/${id}`} className="mt-4 inline-block text-sm text-sky-500 underline">
            View opportunity
          </Link>
        </div>
      </div>
    );
  }

  const canSubmitWork = application.status === "accepted" && !existingSubmission;
  const canReview = existingSubmission && !reviewSubmitted;

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
          {existingSubmission ? "Submission sent" : "Submit completed work"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">for {opportunity.title}</p>

        {submitError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle size={16} strokeWidth={1.5} />
            {submitError}
          </div>
        )}

        {existingSubmission ? (
          <div className="mt-8 space-y-5">
            <div>
              <p className="text-xs tracking-[0.1em] text-gray-400 uppercase">Work description</p>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal">{existingSubmission.description}</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.1em] text-gray-400 uppercase">Hours worked</p>
              <p className="mt-1.5 text-sm text-charcoal">{existingSubmission.hoursWorked}h</p>
            </div>
            {existingSubmission.notes && (
              <div>
                <p className="text-xs tracking-[0.1em] text-gray-400 uppercase">Notes</p>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal">{existingSubmission.notes}</p>
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

            {canReview && (
              <div className="mt-10 border-t border-border pt-8">
                <h2 className="font-serif text-2xl tracking-tight text-charcoal">Leave a review</h2>
                <p className="mt-1 text-sm text-gray-500">Rate your experience with {opportunity.organization}</p>

                <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium tracking-[0.1em] text-gray-400 uppercase">Rating</label>
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewRating(i + 1)}
                          className="transition hover:scale-110"
                        >
                          <Star
                            size={20}
                            strokeWidth={1.5}
                            className={i < reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium tracking-[0.1em] text-gray-400 uppercase">Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Share your experience..."
                      className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={16} strokeWidth={1.5} className="animate-spin" /> : "Submit review"}
                  </button>
                </form>
              </div>
            )}

            {reviewSubmitted && (
              <div className="mt-4 rounded-xl border border-border bg-[#FAFAFA] px-5 py-4 text-sm text-emerald-600">
                Review submitted. Thank you!
              </div>
            )}
          </div>
        ) : canSubmitWork ? (
          <form onSubmit={handleWorkSubmit} className="mt-8 space-y-6">
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
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} strokeWidth={1.5} className="animate-spin" /> : "Submit"}
            </button>
          </form>
        ) : (
          <div className="mt-8 text-center text-gray-500">
            <p className="font-medium">Cannot submit work yet.</p>
            <p className="text-sm mt-1">
              {application.status === "pending"
                ? "Waiting for the organization to accept your application."
                : application.status === "rejected"
                ? "Your application was rejected."
                : existingSubmission
                ? "Work already submitted."
                : "Application status: " + application.status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}