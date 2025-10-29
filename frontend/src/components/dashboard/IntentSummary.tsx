import { useEffect, useMemo, useState } from 'react';
import { onosApi } from '../../utils/onosApi';

type Intent = {
  id?: string;
  appId?: string;
  type?: string;
  state?: string;
  [k: string]: any;
};

export default function IntentSummary() {
  const [intents, setIntents] = useState<Intent[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const data = await onosApi.getIntents();
      if (!alive) return;
      setIntents((data?.intents as Intent[]) ?? []);
    };
    load();
    const t = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const { byState, byType, total } = useMemo(() => {
    const list = intents ?? [];
    const byState = new Map<string, number>();
    const byType = new Map<string, number>();
    for (const it of list) {
      const s = (it.state ?? 'UNKNOWN').toString();
      const t = (it.type ?? 'UNKNOWN').toString().replace(/Intent$/, '');
      byState.set(s, (byState.get(s) ?? 0) + 1);
      byType.set(t, (byType.get(t) ?? 0) + 1);
    }
    return { byState, byType, total: list.length };
  }, [intents]);

  if (intents === null) {
    return <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">Loading intents…</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Intents by State</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...byState.entries()].map(([state, count]) => (
            <div key={state} className="rounded-xl border p-3 text-center bg-gray-50 dark:bg-gray-700">
              <div className="text-sm text-gray-500">{state}</div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
          <div className="rounded-xl border p-3 text-center bg-gray-50 dark:bg-gray-700">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold text-blue-600">{total}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Intents by Type</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...byType.entries()].map(([type, count]) => (
            <div key={type} className="rounded-xl border p-3 text-center bg-gray-50 dark:bg-gray-700">
              <div className="text-sm text-gray-500">{type}</div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
