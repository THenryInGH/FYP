import React, { useState } from "react";
import IntentInput from "./IntentInput";
import { sendPromptToLLM } from "../../utils/llmApi";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { onosApi } from "../../utils/onosApi"; // ✅ Assuming you already have this

type Message = {
  role: "User" | "Agent";
  text: string;
  latencyMs?: number;
  model?: string;
  useRag?: boolean;
};

const MODEL_OPTIONS = [
  { value: "openai/gpt-oss-20b", label: "GPT-OSS 20B" },
  { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B" },
  { value: "qwen/qwen3-32b", label: "Qwen3 32B" },
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
  { value: "whisper-large-v3", label: "OpenAI Whisper 3" },
  
];

const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(33);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].value);
  const [useRag, setUseRag] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (message: string) => {
    setMessages((prev) => [...prev, { role: "User", text: message }]);
    setIsSubmitting(true);
    setError(null);

    const start = performance.now();

    try {
      const reply = await sendPromptToLLM(message, {
        model: selectedModel,
        useRag,
      });
      const latency = reply.processingMs ?? performance.now() - start;

      setLastLatencyMs(latency);
      setMessages((prev) => [
        ...prev,
        {
          role: "Agent",
          text: reply.text,
          latencyMs: latency,
          model: reply.model || selectedModel,
          useRag: reply.useRag ?? useRag,
        },
      ]);
    } catch (err) {
      console.error("Error contacting LLM API:", err);
      setError("Unable to contact LLM Agent. Please try again.");
      setMessages((prev) => [
        ...prev,
        { role: "Agent", text: "Error: Unable to contact LLM Agent." },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyConfiguration = async (configText: string) => {
    const result = await onosApi.applyConfiguration(configText);
    if (result) {
      alert("Intent applied successfully!");
    } else {
      alert("Intent installation failed or was blocked.");
    }
  };


  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 right-0 z-40 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-l-lg shadow-lg hover:bg-gray-700 transition"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed top-0 right-0 h-full z-30 bg-white/80 backdrop-blur-md border-l border-gray-300 shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: `${width}vw` }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col gap-2 p-3 border-b border-gray-200 bg-gray-100/60">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">FYP Agent</h2>
                {lastLatencyMs !== null && (
                  <p className="text-xs text-gray-600">
                    Last response: {Math.round(lastLatencyMs)} ms
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWidth((w) => Math.max(20, w - 5))}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => setWidth((w) => Math.min(60, w + 5))}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs text-gray-700 flex items-center gap-2">
                Model
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="rounded border border-gray-300 bg-white/80 px-2 py-1 text-xs text-gray-800"
                >
                  {MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={useRag}
                  onChange={(e) => setUseRag(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Enable RAG
              </label>

              {error && (
                <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                  {error}
                </span>
              )}
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((msg, i) => (
              <div key={i}>
                <p
                  className={`${
                    msg.role === "User"
                      ? "text-blue-700"
                      : "text-green-800 font-medium"
                  }`}
                >
                  <strong>{msg.role}:</strong> {msg.text.split("```json")[0].trim()}
                </p>

                {msg.role === "Agent" && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    {msg.latencyMs !== undefined && (
                      <span>Response time: {Math.round(msg.latencyMs)} ms</span>
                    )}
                    {msg.model && <span> · Model: {msg.model}</span>}
                    {msg.useRag !== undefined && (
                      <span> · RAG {msg.useRag ? "on" : "off"}</span>
                    )}
                  </p>
                )}

                {/* JSON container if exists */}
                {msg.text.includes("```json") && (
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mt-2 shadow-inner overflow-x-auto">
                    <pre className="text-xs text-gray-800 font-mono whitespace-pre-wrap">
                      {msg.text.match(/```json\s*([\s\S]*?)```/)?.[1] ?? ""}
                    </pre>

                    {/* Apply button */}
                    <button
                      onClick={() =>
                        handleApplyConfiguration(
                          msg.text.match(/```json\s*([\s\S]*?)```/)?.[1] ?? ""
                        )
                      }
                      className="mt-3 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      Apply Configuration
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>


          {/* Input area */}
          <div className="p-3 border-t border-gray-200 bg-gray-100/60">
            <IntentInput onSubmit={handleSubmit} disabled={isSubmitting} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;
