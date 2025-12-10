const LLM_API = import.meta.env.VITE_LLM_API;

export type LLMOptions = {
  model?: string;
  useRag?: boolean;
};

export type LLMApiResult = {
  text: string;
  model?: string;
  useRag?: boolean;
  processingMs?: number;
  serverTimings?: Record<string, number>;
};

export async function sendPromptToLLM(
  prompt: string,
  options: LLMOptions = {}
): Promise<LLMApiResult> {
  const start = performance.now();
  try {
    const response = await fetch(LLM_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model: options.model,
        use_rag: options.useRag ?? true,
      }),
    });

    const data = await response.json();
    if (data.status === "success") {
      const serverMs = data?.timings?.total_seconds
        ? data.timings.total_seconds * 1000
        : undefined;

      return {
        text: data.response,
        model: data.model,
        useRag: data.use_rag,
        processingMs: serverMs ?? performance.now() - start,
        serverTimings: data.timings,
      };
    }

    throw new Error(data.message || "Unknown error");
  } catch (error) {
    console.error("Error contacting LLM API:", error);
    throw error;
  }
}
