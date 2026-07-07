import { useState } from "react";
import type { Checklist } from "../lib/types";
import { loadLists, saveLists } from "../lib/storage";
import VerifyBadge from "./VerifyBadge";

export default function ChecklistView({ list }: { list: Checklist }) {
  const [state, setState] = useState(loadLists());
  const doneCount = list.items.filter((i) => state.done[`${list.id}.${i.id}`]).length;
  const pct = Math.round((doneCount / list.items.length) * 100);

  function toggle(itemId: string) {
    const key = `${list.id}.${itemId}`;
    const next = { ...state, done: { ...state.done, [key]: !state.done[key] } };
    setState(next);
    saveLists(next);
  }

  return (
    <section className="card reveal">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="text-xl">{list.title}</h2>
        <span className="font-mono text-sm text-ink/70">
          {doneCount}/{list.items.length} · {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-ink/10 rounded-full mt-2 mb-3 overflow-hidden">
        <div className="h-full bg-cleargreen rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      {list.banner && <p className="banner-caution mb-3">{list.banner}</p>}
      <ul className="space-y-3">
        {list.items.map((item) => {
          const done = !!state.done[`${list.id}.${item.id}`];
          return (
            <li key={item.id} className="flex gap-3 items-start">
              <input
                type="checkbox"
                id={`${list.id}-${item.id}`}
                checked={done}
                onChange={() => toggle(item.id)}
                className="mt-1 h-5 w-5 accent-cleargreen shrink-0"
              />
              <label htmlFor={`${list.id}-${item.id}`} className="cursor-pointer">
                <span className={`font-semibold ${done ? "line-through text-ink/50" : ""}`}>{item.title}</span>
                <span className="block text-sm text-ink/70">{item.why}</span>
                <span className="flex gap-2 items-center mt-0.5 flex-wrap">
                  {item.link && (
                    <a className="text-linkblue text-sm underline" href={item.link} target="_blank" rel="noopener noreferrer">
                      official page →
                    </a>
                  )}
                  <VerifyBadge confidence={item.confidence} lastVerified={item.last_verified} sources={item.sources} />
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <button className="btn btn-secondary mt-4 no-print" onClick={() => window.print()}>
        Print this checklist
      </button>
    </section>
  );
}
