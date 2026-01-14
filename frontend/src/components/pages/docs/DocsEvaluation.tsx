import { PageTitle } from "./DocBlocks";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

function ImgCard({ title, src, caption }: { title: string; src: string; caption?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      {caption ? <div className="mt-1 text-xs text-gray-600">{caption}</div> : null}
      <a href={src} target="_blank" rel="noreferrer">
        <img className="mt-4 w-full rounded-xl border bg-gray-50" src={src} alt={title} />
      </a>
      <div className="mt-2 text-xs text-gray-500">Click image to open full size.</div>
    </div>
  );
}

export default function DocsEvaluation() {
  return (
    <div className="space-y-6">
      <PageTitle title="Evaluation" subtitle="Summary charts from the evaluation folder." />

      <div className="max-w-4xl space-y-4">
        <ImgCard
          title="Average accuracy by model"
          src={`${API_BASE}/docs-assets/avg_accuracy_by_model.png`}
          caption="Chart generated from evaluation runs."
        />
        <ImgCard
          title="Average response time by model"
          src={`${API_BASE}/docs-assets/avg_response_time_by_model.png`}
        />
        <ImgCard
          title="Average response time by model (log scale)"
          src={`${API_BASE}/docs-assets/avg_response_time_by_model_log.png`}
        />
      </div>
    </div>
  );
}

