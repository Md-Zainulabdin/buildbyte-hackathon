import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import type { Opportunity } from "../../types/opportunity";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onApply: (id: string) => void;
  applied: boolean;
}

export default function OpportunityCard({
  opportunity,
  onApply,
  applied,
}: OpportunityCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white px-7 py-7 transition hover:shadow-sm sm:px-8 sm:py-8">
      <Link to={`/opportunities/${opportunity.id}`} className="group block">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="rounded-full border border-sky-500/30 px-2 py-0.5 text-[10px] font-medium tracking-[0.15em] text-sky-500 uppercase">
            {opportunity.category}
          </span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.1em] uppercase ${
              opportunity.paid === "Paid"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {opportunity.paid}
          </span>
        </div>

        <h3 className="font-serif text-2xl leading-snug tracking-tight text-charcoal group-hover:text-sky-500 transition-colors">
          {opportunity.title}
        </h3>
        <p className="mt-2 text-base text-gray-500">
          {opportunity.organization}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={15} strokeWidth={1.5} />
            {opportunity.area}, {opportunity.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={15} strokeWidth={1.5} />
            {new Date(opportunity.deadline).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      </Link>

      <div className="mt-6">
        <button
          onClick={() => onApply(opportunity.id)}
          disabled={applied}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition ${
            applied
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-black text-white hover:bg-black/90"
          }`}
        >
          {applied ? "Applied" : "Apply now"}
        </button>
      </div>
    </div>
  );
}
