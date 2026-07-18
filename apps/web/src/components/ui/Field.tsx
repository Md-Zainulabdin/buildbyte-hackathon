import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export default function Field({ label, error, children }: FieldProps) {
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
