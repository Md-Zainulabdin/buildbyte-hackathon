import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import FilterBar from "../components/opportunities/FilterBar";
import { opportunitiesApi, type OpportunityResponse } from "../lib/api";
import { applicationsApi, type ApplicationCreate } from "../lib/api";

interface Filters {
  search: string;
  location: string;
  category: string;
  type: string;
}

export default function OpportunityFeed() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<Filters>({
    search: "",
    location: "",
    category: "",
    type: "",
  });
  const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    loadOpportunities();
    if (isAuthenticated) loadAppliedIds();
  }, [authLoading, filters, isAuthenticated]);

  async function loadOpportunities() {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | boolean | undefined> = {
        status: "open",
      };
      if (filters.category) params.category = filters.category;
      if (filters.type) params.is_paid = filters.type === "Paid";
      if (filters.location) params.location = filters.location;
      if (filters.search) params.skills = filters.search;

      const res = await opportunitiesApi.list(params);
      setOpportunities(res.data);
    } catch (err) {
      setError("Failed to load opportunities");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAppliedIds() {
    try {
      const res = await applicationsApi.listMy("provider");
      setAppliedIds(res.data.map((a) => a.opportunity_id));
    } catch {}
  }

  async function handleApply(id: string) {
    if (!isAuthenticated) {
      window.location.href = "/auth/callback?redirect=/opportunities";
      return;
    }
    try {
      await applicationsApi.apply(id, { message: "" });
      setAppliedIds((prev) => [...prev, id]);
    } catch (err) {
      console.error("Apply failed:", err);
      alert("Failed to apply. Please try again.");
    }
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
              {isLoading
                ? "Loading..."
                : opportunities.length === 0
                  ? "No opportunities"
                  : `${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"} found`}
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
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        {isLoading ? (
          <div className="mt-20 text-center">
            <div className="mx-auto mb-6 h-8 w-8 animate-pulse rounded-full border-2 border-gray-300 border-t-gray-600" />
            <p className="font-serif text-2xl text-gray-500">Loading opportunities...</p>
          </div>
        ) : error ? (
          <div className="mt-20 text-center">
            <p className="font-serif text-2xl text-red-500">{error}</p>
            <button onClick={loadOpportunities} className="mt-4 text-sm text-sky-500 underline">
              Retry
            </button>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="font-serif text-2xl text-gray-400">No opportunities yet</p>
            <p className="mt-2 text-sm text-gray-400">
              Be the first to{" "}
              <Link to="/opportunities/new" className="text-sky-500 underline">
                post one
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {opportunities.map((opp) => (
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