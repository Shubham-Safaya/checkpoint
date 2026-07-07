export type Confidence = "verified" | "needs_verification" | "sample_data";

export interface Source {
  title: string;
  url: string;
}

export interface FactMeta {
  sources: Source[];
  last_verified: string; // ISO date or "TODO"
  confidence: Confidence;
}

/** Profile answers — every value is a dropdown option id or null (= unknown). */
export type Profile = Record<string, string | string[] | null>;

export type TravelVerdict = "none" | "evisa" | "voa" | "required" | "transit";

export interface DestinationRecord extends FactMeta {
  id: string;
  name: string;
  flag: string;
  region: string;
  /** verdict for an Indian passport with no other documents */
  base: { verdict: TravelVerdict; summary: string };
  /** overrides when the traveller holds these documents */
  modifiers?: {
    us_visa?: { verdict: TravelVerdict; summary: string };
    green_card?: { verdict: TravelVerdict; summary: string };
  };
  apply_how: string[];
  processing_note?: string;
  notes?: string;
}

export interface ChecklistItem extends FactMeta {
  id: string;
  title: string;
  why: string;
  link?: string;
}

export interface Checklist {
  id: string;
  title: string;
  banner?: string;
  group: "immigration" | "money-us" | "money-india" | "travel" | "decisions";
  items: ChecklistItem[];
}
