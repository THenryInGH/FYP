import { useEffect, useState } from "react";
import { onosApi } from "../../utils/onosApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

type Intent = {
  appId: string;
  key: string;
  type?: string;
  state?: string;
  [k: string]: any;
};

export default function IntentSummary() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [intents, setIntents] = useState<Intent[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadIntents = async () => {
    const data = await onosApi.getIntents();
    setIntents((data?.intents as Intent[]) ?? []);
  };

  useEffect(() => {
    loadIntents();
    const interval = setInterval(loadIntents, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (appId: string, key: string) => {
    if (!user) {
      alert("Login required to delete intents.");
      nav("/login");
      return;
    }
    if (!confirm("Are you sure you want to delete this intent?")) return;
    setDeleting(`${appId}:${key}`);
    const success = await onosApi.deleteIntent(appId, key);
    if (success) {
      alert("Intent deleted successfully!");
      await loadIntents();
    } else {
      alert("Failed to delete intent.");
    }
    setDeleting(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-6 relative">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Installed Intents
      </h3>

      {intents.length === 0 ? (
        <div className="text-gray-500">No intents found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">App ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Key</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">State</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {intents.map((intent) => (
                <tr
                  key={`${intent.appId}:${intent.key}`}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2 text-gray-800">{intent.appId}</td>
                  <td className="px-4 py-2 text-gray-800">{intent.key}</td>
                  <td className="px-4 py-2 text-gray-800">{intent.type ?? "N/A"}</td>
                  <td className="px-4 py-2 text-gray-800">{intent.state ?? "UNKNOWN"}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(intent.appId, intent.key)}
                      disabled={deleting === `${intent.appId}:${intent.key}`}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                        deleting === `${intent.appId}:${intent.key}`
                          ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-600 shadow-sm"
                      }`}
                    >
                      {deleting === `${intent.appId}:${intent.key}` ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
