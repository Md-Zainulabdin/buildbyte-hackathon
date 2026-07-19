import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import TagInput from "../components/forms/TagInput";
import LocationSelect from "../components/forms/LocationSelect";
import Field from "../components/ui/Field";

interface ProfileForm {
  name: string;
  bio: string;
  skills: string[];
  city: string;
  area: string;
  availability: string;
  portfolio: string;
}

const availabilityOptions = [
  "Full-time",
  "Part-time",
  "Weekends",
  "Evenings",
  "Flexible",
];

function parseLocation(location: string | null): { city: string; area: string } {
  if (!location) return { city: "", area: "" };
  const parts = location.split(", ");
  return { city: parts[0] || "", area: parts[1] || "" };
}

export default function CreateProfile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const initialLocation = parseLocation(user?.location ?? null);
  const [form, setForm] = useState<ProfileForm>({
    name: user?.name || "",
    bio: user?.bio || "",
    skills: user?.skills || [],
    city: initialLocation.city,
    area: initialLocation.area,
    availability: user?.availability || "",
    portfolio: user?.portfolio_links?.[0] || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = "Name is required (min 2 characters)";
    if (form.skills.length === 0) errs.skills = "Add at least one skill";
    if (!form.city) errs.city = "Select a city";
    if (!form.area) errs.area = "Select an area";
    if (!form.availability) errs.availability = "Select availability";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const location = `${form.city}, ${form.area}`;
      const portfolioLinks = form.portfolio ? [form.portfolio] : [];

      await api.patch("/users/me", {
        name: form.name.trim(),
        bio: form.bio.trim() || null,
        skills: form.skills,
        location,
        availability: form.availability,
        portfolio_links: portfolioLinks,
      });

      await refreshUser();
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save profile";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[520px]">
        <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-charcoal sm:text-5xl">
          Create your profile
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Help communities find you. Add your skills and location so relevant
          opportunities come your way.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <Field label="Name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            />
          </Field>

          <Field label="Bio (optional)">
            <textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Tell the community a bit about yourself..."
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            />
          </Field>

          <Field label="Skills" error={errors.skills}>
            <TagInput tags={form.skills} onChange={(tags) => update("skills", tags)} />
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

          <Field label="Availability" error={errors.availability}>
            <select
              value={form.availability}
              onChange={(e) => update("availability", e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            >
              <option value="">Select availability</option>
              {availabilityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Portfolio (optional)">
            <input
              type="url"
              value={form.portfolio}
              onChange={(e) => update("portfolio", e.target.value)}
              placeholder="https://your-portfolio.com"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save profile
                <ArrowRight size={16} strokeWidth={1.5} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}