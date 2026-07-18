import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import TagInput from "../components/forms/TagInput";
import LocationSelect from "../components/forms/LocationSelect";

interface ProfileForm {
  name: string;
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

export default function CreateProfile() {
  const navigate = useNavigate();
  const { login, user, token } = useAuth();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    skills: [],
    city: "",
    area: "",
    availability: "",
    portfolio: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const profile = {
      ...form,
      name: form.name.trim(),
    };

    localStorage.setItem("profile", JSON.stringify(profile));

    if (user && token) {
      login(token, { ...user, ...profile });
    }

    navigate("/opportunities");
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
          <Field label="Name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
            />
          </Field>

          <Field label="Skills" error={errors.skills}>
            <TagInput
              tags={form.skills}
              onChange={(tags) => update("skills", tags)}
            />
          </Field>

          <LocationSelect
            city={form.city}
            area={form.area}
            onCityChange={(city) => update("city", city)}
            onAreaChange={(area) => update("area", area)}
          />
          {(errors.city || errors.area) && (
            <p className="mt-1 text-xs text-red-500">
              {errors.city || errors.area}
            </p>
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-medium text-white transition hover:bg-black/90"
          >
            Save profile
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
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
