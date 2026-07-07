import type { Profile } from "./types";

function b64urlEncode(s: string): string {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeProfile(p: Profile): string {
  return b64urlEncode(JSON.stringify(p));
}

export function decodeProfile(s: string): Profile | null {
  try {
    const p = JSON.parse(b64urlDecode(s));
    return typeof p === "object" && p ? p : null;
  } catch {
    return null;
  }
}

export function shareUrl(p: Profile): string {
  const base = window.location.origin + import.meta.env.BASE_URL;
  return `${base}?p=${encodeProfile(p)}`;
}

/** Fresh-wizard link for "make one for someone else" — never carries your data. */
export function freshUrl(): string {
  return window.location.origin + import.meta.env.BASE_URL + "?fresh=1";
}
