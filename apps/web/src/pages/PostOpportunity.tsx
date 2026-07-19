import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import TagInput from "../components/forms/TagInput";
import LocationSelect from "../components/forms/LocationSelect";
import Field from "../components/ui/Field";
import { opportunitiesApi, type OpportunityCreate, type OpportunityResponse } from "../lib/api";

const CATEGORIES = [
  { value: "paid_work", label: "Paid Work" },
  { value: "volunteer", label: "Volunteer" },
  { value: "mentorship", label: "Mentorship" },
  { value: "tutoring", label: "Tutoring" },
  { value: "event_support", label: "Event Support" },
  { value: "technical_help", label: "Technical Help" },
  { value: "design_request", label: "Design Request" },
  { value: "community_service", label: "Community Service" },
  { value: "short_term_project", label: "Short-term Project" },
];

const URGENCY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

function parseLocation(location: string | null): { city: string; area: string } {
  if (!location) return { city: "", area: "" };
  const parts = location.split(", ");
  return { city: parts[0] || "", area: parts[1] || "" };
}

export default function PostOpportunity() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: authLoading } = useAuth();

  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [form, setForm] = useState({
    title: "",
    description: "",
    organization: "",
    city: "",
    area: "",
    required_skills: [] as string[],
    is_paid: false,
    payment_amount: undefined as number | undefined,
    deadline: "",
    estimated_hours: undefined as number | undefined,
    urgency: "medium" as "low" | "medium" | "high" | "critical",
    category: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingOpp, setIsLoadingOpp] = useState(isEditing);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await opportunitiesApi.get(editId);
        const opp = res.data;
        const loc = parseLocation(opp.location);
        setForm({
          title: opp.title,
          description: opp.description,
          organization: opp.organization,
          city: loc.city,
          area: loc.area,
          required_skills: opp.required_skills || [],
          is_paid: opp.is_paid,
          payment_amount: opp.payment_amount ?? undefined,
          deadline: opp.deadline ? opp.deadline.slice(0, 10) : "",
          estimated_hours: opp.estimated_hours ?? undefined,
          urgency: opp.urgency,
          category: opp.category,
        });
      } catch {
        setSubmitError("Failed to load opportunity for editing.");
      } finally {
        setIsLoadingOpp(false);
      }
    })();
  }, [editId]);

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.organization.trim()) errs.organization = "Organization name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (form.required_skills?.length === 0) errs.required_skills = "Add at least one required skill";
    if (!form.category) errs.category = "Select a category";
    if (!form.city) errs.city = "Select a city";
    if (!form.area) errs.area = "Select an area";
    if (!form.is_paid && form.payment_amount && form.payment_amount > 0) {
      errs.payment_amount = "Payment amount only applies to paid opportunities";
    }
    if (!form.deadline) errs.deadline = "Select a deadline";
    if (!form.urgency) errs.urgency = "Select urgency level";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const location = `${form.city}, ${form.area}`;

    const payload: OpportunityCreate = {
      title: form.title.trim(),
      description: form.description.trim(),
      organization: form.organization.trim(),
      location,
      required_skills: form.required_skills && form.required_skills.length > 0 ? form.required_skills : undefined,
      is_paid: form.is_paid,
      payment_amount: form.is_paid && form.payment_amount ? form.payment_amount : undefined,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : undefined,
      urgency: form.urgency,
      category: form.category,
    };

    try {
      if (isEditing && editId) {
        await opportunitiesApi.update(editId, payload);
      } else {
        await opportunitiesApi.create(payload);
      }
      navigate("/opportunities");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setSubmitError(axiosErr.response?.data?.detail || "Failed to save opportunity. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  if (authLoading || isLoadingOpp) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-6 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <p className="font-serif text-2xl text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[520px]">
        <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-charcoal sm:text-5xl">
          {isEditing ? "Edit opportunity" : "Post an opportunity"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          {isEditing ? "Update the details of your opportunity." : "Describe what you need and find the right person from your community."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <Field label="Title" error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Mathematics tutor for grade 10"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            />
          </Field>

          <Field label="Organization" error={errors.organization}>
            <input
              type="text"
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
              placeholder="Your school, NGO, or business name"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the task, what kind of help you need, and any relevant details..."
              rows={4}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            />
          </Field>

          <Field label="Required Skills" error={errors.required_skills}>
            <TagInput
              tags={form.required_skills}
              onChange={(tags) => update("required_skills", tags)}
              placeholder="e.g. Mathematics, Urdu, Teaching"
            />
          </Field>

          <Field label="Category" error={errors.category}>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Urgency" error={errors.urgency}>
            <select
              value={form.urgency}
              onChange={(e) => update("urgency", e.target.value as "low" | "medium" | "high" | "critical")}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            >
              <option value="">Select urgency</option>
              {URGENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <LocationSelect
            city={form.city}
            area={form.area}
            onCityChange={(city) => update("city", city)}
            onAreaChange={(area) => update("area", area)}
          />
          {(errors.city || errors.area) && (
            <p className="mt-1 text-xs text-red-500">{errors.city || errors.area}</p>
          )}

          <fieldset>
            <label className="mb-2 block text-xs font-medium tracking-[0.1em] text-gray-500 uppercase">
              Type
            </label>
            {errors.is_paid && <p className="mb-2 text-xs text-red-500">{errors.is_paid}</p>}
            <div className="flex gap-3">
              {["Paid", "Volunteer"].map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm transition ${
                    (form.is_paid && option === "Paid") || (!form.is_paid && option === "Volunteer")
                      ? "border-sky-500 bg-brand-bg text-sky-500"
                      : "border-border bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="is_paid"
                    value={option === "Paid" ? "true" : "false"}
                    checked={form.is_paid === (option === "Paid")}
                    onChange={() => update("is_paid", option === "Paid")}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          {form.is_paid && (
            <Field label="Payment Amount (optional)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.payment_amount ?? ""}
                onChange={(e) => update("payment_amount", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 5000"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
              />
            </Field>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Deadline" error={errors.deadline}>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
              />
            </Field>

            <Field label="Est. hours (optional)">
              <input
                type="number"
                min="1"
                value={form.estimated_hours ?? ""}
                onChange={(e) => update("estimated_hours", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 10"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
              />
            </Field>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle size={16} strokeWidth={1.5} />
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                {isEditing ? "Saving..." : "Posting..."}
              </>
            ) : (
              <>
                {isEditing ? "Save changes" : "Post opportunity"}
                <ArrowRight size={16} strokeWidth={1.5} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}