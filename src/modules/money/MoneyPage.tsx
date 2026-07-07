import c1 from "../../data/checklists/c1-us-first-90-days.json";
import c2 from "../../data/checklists/c2-india-nri-compliance.json";
import type { Checklist } from "../../lib/types";
import ChecklistView from "../../components/ChecklistView";

export default function MoneyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl mb-1">Money & compliance</h1>
        <p className="banner-caution">Educational information, not investment or tax advice. Confirm with a CPA (US) and CA (India) before acting.</p>
      </div>
      <ChecklistView list={c1 as unknown as Checklist} />
      <ChecklistView list={c2 as unknown as Checklist} />
    </div>
  );
}
