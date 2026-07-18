import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import FilterBar from "../components/opportunities/FilterBar";
import { CITIES } from "../constants/locations";
import { getOpportunities, safeJSON } from "../lib/helpers";

interface Filters {
  search: string;
  city: string;
  category: string;
  type: string;
}

export default function OpportunityFeed() {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    city: "",
    category: "",
    type: "",
  });
  const [appliedIds, setAppliedIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("applications");
    const apps = safeJSON<{ opportunityId: string }[]>(stored || "[]", []);
    return apps.map((a) => a.opportunityId);
  });

  const opportunities = useMemo(() => getOpportunities(), []);

  const filtered = useMemo(() => {
    return opportunities.filter((opp) => {
      if (
        filters.search &&
        !opp.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !opp.organization.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.city && opp.city !== filters.city) return false;
      if (filters.category && opp.category !== filters.category) return false;
      if (filters.type && opp.paid !== filters.type) return false;
      return true;
    });
  }, [opportunities, filters]);

  function handleApply(id: string) {
    const applications = safeJSON<Record<string, string>[]>(localStorage.getItem("applications") || "[]", []);
    applications.push({
      opportunityId: id,
      appliedAt: new Date().toISOString(),
    });
    localStorage.setItem("applications", JSON.stringify(applications));
    setAppliedIds((prev) => [...prev, id]);
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-28 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-charcoal sm:text-5xl">
              Opportunities
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {filtered.length === 0 ? "No opportunities" : `${filtered.length} opportunit${filtered.length === 1 ? "y" : "ies"} found`}
            </p>
          </div>
          <Link
            to="/opportunities/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90"
          >
            Post one
          </Link>
        </div>

        <div className="mt-8">
          <FilterBar
            filters={filters}
            cities={CITIES.map((c) => c.name)}
            onChange={setFilters}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="font-serif text-2xl text-gray-400">
              No opportunities yet
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Be the first to{" "}
              <Link
                to="/opportunities/new"
                className="text-sky-500 underline"
              >
                post one
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {filtered.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onApply={handleApply}
                applied={appliedIds.includes(opp.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
