import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, Building2 } from "lucide-react";
import dummyOpportunities from "../constants/dummy-opportunities.json";

interface Opportunity {
  id: string;
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
  createdAt: string;
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const opportunity = useMemo(() => {
    const stored = localStorage.getItem("opportunities");
    const parsed = stored ? JSON.parse(stored) : [];
    const all = parsed.length > 0 ? parsed : dummyOpportunities;
    return all.find((o: Opportunity) => o.id === id) as Opportunity | undefined;
  }, [id]);

  const applied = useMemo(() => {
    const stored = localStorage.getItem("applications");
    const apps = stored ? JSON.parse(stored) : [];
    return apps.some((a: { opportunityId: string }) => a.opportunityId === id);
  }, [id]);

  function handleApply() {
    if (!id) return;
    const applications = JSON.parse(localStorage.getItem("applications") || "[]");
    applications.push({ opportunityId: id, appliedAt: new Date().toISOString() });
    localStorage.setItem("applications", JSON.stringify(applications));
    navigate("/opportunities");
  }

  if (!opportunity) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="font-serif text-2xl text-gray-400">Opportunity not found</p>
          <Link to="/opportunities" className="mt-4 inline-block text-sm text-sky-500 underline">
            Back to opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[680px]">
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
          <span
            className={`shrink-0 rounded-full px-3 py-0.5 text-[10px] font-medium tracking-[0.1em] uppercase ${
              opportunity.paid === "Paid"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {opportunity.paid}
          </span>
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
            {opportunity.skills.map((skill) => (
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
          <div className="flex items-center justify-between border-b border-border px-6 py-4 last:border-b-0">
            <span className="text-xs tracking-[0.1em] text-gray-400 uppercase">Location</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-charcoal">
              <MapPin size={14} strokeWidth={1.5} className="text-gray-400" />
              {opportunity.area}, {opportunity.city}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border px-6 py-4 last:border-b-0">
            <span className="text-xs tracking-[0.1em] text-gray-400 uppercase">Deadline</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-charcoal">
              <Calendar size={14} strokeWidth={1.5} className="text-gray-400" />
              {new Date(opportunity.deadline).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border px-6 py-4 last:border-b-0">
            <span className="text-xs tracking-[0.1em] text-gray-400 uppercase">Est. hours</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-charcoal">
              <Clock size={14} strokeWidth={1.5} className="text-gray-400" />
              {opportunity.estimatedHours || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border px-6 py-4 last:border-b-0">
            <span className="text-xs tracking-[0.1em] text-gray-400 uppercase">Posted by</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-charcoal">
              <Building2 size={14} strokeWidth={1.5} className="text-gray-400" />
              {opportunity.organization}
            </span>
          </div>
        </div>

        <div className="mt-10">
          <button
            onClick={handleApply}
            disabled={applied}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium transition sm:w-auto sm:px-10 ${
              applied
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-black text-white hover:bg-black/90"
            }`}
          >
            {applied ? "Already applied" : "Apply now"}
          </button>
        </div>
      </div>
    </div>
  );
}
