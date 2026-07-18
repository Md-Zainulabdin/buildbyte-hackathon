import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
}

export default function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-block rounded-full bg-sky-50 px-4 py-1.5 text-[11px] font-medium tracking-[0.2em] text-sky-500 uppercase">
      {children}
    </span>
  );
}
