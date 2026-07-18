import type { Opportunity } from "../types/opportunity";
import dummyOpportunities from "../constants/dummy-opportunities.json";

export function getOpportunities(): Opportunity[] {
  const stored = localStorage.getItem("opportunities");
  const parsed: Opportunity[] = stored ? safeJSON(stored, []) : [];
  return parsed.length > 0 ? parsed : (dummyOpportunities as Opportunity[]);
}

export function safeJSON<T>(data: string, fallback: T): T {
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
