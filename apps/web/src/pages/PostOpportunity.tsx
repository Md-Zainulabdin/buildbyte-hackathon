import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import TagInput from "../components/forms/TagInput";
import LocationSelect from "../components/forms/LocationSelect";
import { CATEGORIES } from "../constants/categories";

interface OpportunityForm {
  title: string;
  organization: string;
  description: string;
  skills: string[];
  city: string;
  area: string;
  category: string;
  paid: string;
  deadline: string;
  estimatedHours: string;
}

export default function PostOpportunity() {
  const navigate = useNavigate();
  const [form, setForm] = useState<OpportunityForm>({
    title: "",
    organization: "",
    description: "",
    skills: [],
    city: "",
    area: "",
    category: "",
    paid: "",
    deadline: "",
    estimatedHours: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OpportunityForm, string>>>({});

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.organization.trim()) errs.organization = "Organization name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (form.skills.length === 0) errs.skills = "Add at least one required skill";
    if (!form.city) errs.city = "Select a city";
    if (!form.area) errs.area = "Select an area";
    if (!form.category) errs.category = "Select a category";
    if (!form.paid) errs.paid = "Select paid or volunteer";
    if (!form.deadline) errs.deadline = "Select a deadline";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const opportunity = {
      ...form,
      title: form.title.trim(),
      organization: form.organization.trim(),
      description: form.description.trim(),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("opportunities") || "[]");
    existing.push(opportunity);
    localStorage.setItem("opportunities", JSON.stringify(existing));

    navigate("/opportunities");
  }

  function update<K extends keyof OpportunityForm>(key: K, value: OpportunityForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[520px]">
        <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-charcoal sm:text-5xl">
          Post an opportunity
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Describe what you need and find the right person from your community.
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
              className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            />
          </Field>

          <Field label="Required Skills" error={errors.skills}>
            <TagInput
              tags={form.skills}
              onChange={(tags) => update("skills", tags)}
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
                <option key={cat} value={cat}>
                  {cat}
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
            <p className="text-xs text-red-500">
              {errors.city || errors.area}
            </p>
          )}

          <fieldset>
            <label className="mb-2 block text-xs font-medium tracking-[0.1em] text-gray-500 uppercase">
              Type
            </label>
            {errors.paid && (
              <p className="mb-2 text-xs text-red-500">{errors.paid}</p>
            )}
            <div className="flex gap-3">
              {["Paid", "Volunteer"].map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm transition ${
                    form.paid === option
                      ? "border-sky-500 bg-brand-bg text-sky-500"
                      : "border-border bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paid"
                    value={option}
                    checked={form.paid === option}
                    onChange={(e) => update("paid", e.target.value)}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Deadline" error={errors.deadline}>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
              />
            </Field>

            <Field label="Est. hours (optional)">
              <input
                type="number"
                min="1"
                value={form.estimatedHours}
                onChange={(e) => update("estimatedHours", e.target.value)}
                placeholder="e.g. 10"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
              />
            </Field>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-medium text-white transition hover:bg-black/90"
          >
            Post opportunity
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium tracking-[0.1em] text-gray-500 uppercase">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
