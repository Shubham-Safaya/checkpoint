import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { SITE_NAME } from "./siteConfig";
import { decodeProfile } from "./lib/share";
import { saveProfile, clearProfile, loadProfile } from "./lib/storage";
import type { Profile } from "./lib/types";

export default function App() {
  const navigate = useNavigate();
  const [incoming, setIncoming] = useState<Profile | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("fresh") === "1") {
      clearProfile();
      window.history.replaceState({}, "", window.location.pathname);
      navigate("/profile");
      return;
    }
    const p = params.get("p");
    if (p) {
      const decoded = decodeProfile(p);
      if (decoded) setIncoming(decoded);
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/profile", label: "Profile" },
    { to: "/travel", label: "Travel" },
    { to: "/money", label: "Money" },
    { to: "/immigration/eb1a-tracker", label: "EB1A" },
    { to: "/my-list", label: "My list" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink/10 bg-paper/95 sticky top-0 z-10 backdrop-blur no-print">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4 overflow-x-auto">
          <Link to="/" className="font-display font-bold text-lg whitespace-nowrap">{SITE_NAME}</Link>
          <nav className="flex gap-1 text-sm" aria-label="Main">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-md whitespace-nowrap ${isActive ? "bg-ink text-paper" : "hover:bg-ink/5"}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {incoming && (
        <div className="banner-caution m-3 flex items-center gap-3 flex-wrap no-print" role="alertdialog">
          <span>Someone shared a profile with you. Load it? It will replace the answers stored in this browser.</span>
          <button className="btn !py-1.5 text-xs"
            onClick={() => { saveProfile(incoming); setIncoming(null); navigate("/my-list"); }}>
            Load this profile
          </button>
          <button className="btn btn-secondary !py-1.5 text-xs" onClick={() => setIncoming(null)}>
            Keep mine
          </button>
        </div>
      )}

      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 px-4 py-5 text-xs text-ink/60">
        <div className="max-w-4xl mx-auto space-y-1.5">
          <p>
            <strong>{SITE_NAME} is educational information, not legal, immigration, tax, or investment advice.</strong>{" "}
            Rules change — every fact shows when it was last verified. Confirm with a licensed attorney or CPA before acting.
          </p>
          <p>Your answers never leave your browser. No accounts, no cookies, no trackers.</p>
          <p className="font-mono">
            profile: {loadProfile().citizenship ? "saved locally" : "empty"} · open source ·{" "}
            <a className="underline" href="https://github.com/Shubham-Safaya/checkpoint" target="_blank" rel="noopener noreferrer">github</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
