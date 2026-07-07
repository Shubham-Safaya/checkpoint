import type { Profile } from "./types";

const PROFILE_KEY = "checkpoint.profile.v1";
const LISTS_KEY = "checkpoint.checklists.v1";

export function loadProfile(): Profile {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveProfile(p: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

/* checklist state:
   { done: { "<listId>.<itemId>": true },
     eb1a: { [criterionId]: { strength: "none"|"building"|"strong", artifacts: string[] } } } */
export interface ListState {
  done: Record<string, boolean>;
  eb1a: Record<string, { strength: string; artifacts: string[] }>;
}

export function loadLists(): ListState {
  try {
    const raw = JSON.parse(localStorage.getItem(LISTS_KEY) || "{}");
    return { done: raw.done || {}, eb1a: raw.eb1a || {} };
  } catch {
    return { done: {}, eb1a: {} };
  }
}

export function saveLists(s: ListState) {
  localStorage.setItem(LISTS_KEY, JSON.stringify(s));
}
