import { CATEGORIES } from "../../constants/categories";

interface Filters {
  search: string;
  city: string;
  category: string;
  type: string;
}

interface FilterBarProps {
  filters: Filters;
  cities: string[];
  onChange: (filters: Filters) => void;
}

export default function FilterBar({
  filters,
  cities,
  onChange,
}: FilterBarProps) {
  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        placeholder="Search opportunities..."
        className="min-w-[200px] flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-charcoal outline-none placeholder:text-gray-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
      />

      <select
        value={filters.city}
        onChange={(e) => update("city", e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
      >
        <option value="">All cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <select
        value={filters.category}
        onChange={(e) => update("category", e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        value={filters.type}
        onChange={(e) => update("type", e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
      >
        <option value="">All types</option>
        <option value="Paid">Paid</option>
        <option value="Volunteer">Volunteer</option>
      </select>

      {(filters.search || filters.city || filters.category || filters.type) && (
        <button
          onClick={() => onChange({ search: "", city: "", category: "", type: "" })}
          className="rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:text-charcoal"
        >
          Reset
        </button>
      )}
    </div>
  );
}
