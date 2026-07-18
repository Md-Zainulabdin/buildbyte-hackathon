import { CITIES, type City } from "../../constants/locations";

interface LocationSelectProps {
  city: string;
  area: string;
  onCityChange: (city: string) => void;
  onAreaChange: (area: string) => void;
}

export default function LocationSelect({
  city,
  area,
  onCityChange,
  onAreaChange,
}: LocationSelectProps) {
  const selectedCity: City | undefined = CITIES.find((c) => c.name === city);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-xs font-medium tracking-[0.1em] text-gray-500 uppercase">
          City
        </label>
        <select
          value={city}
          onChange={(e) => {
            onCityChange(e.target.value);
            onAreaChange("");
          }}
          className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
        >
          <option value="">Select city</option>
          {CITIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium tracking-[0.1em] text-gray-500 uppercase">
          Area
        </label>
        <select
          value={area}
          onChange={(e) => onAreaChange(e.target.value)}
          disabled={!city}
          className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select area</option>
          {selectedCity?.areas.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
